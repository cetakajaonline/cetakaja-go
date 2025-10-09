import { json } from '@sveltejs/kit';
import type { RequestEvent } from './$types';
import prisma from '$lib/server/prisma';
import { orderSchema } from '$lib/validations/orderSchema';
import { 
  createOrder as createOrderService,
  getNextOrderNumberForToday,
  getOrderByOrderNumber
} from '$lib/server/orderService';
import { saveFile } from '$lib/server/uploadService';
import fs from 'fs';
import path from 'path';

export async function POST(event: RequestEvent) {
  try {
    // Only admin and staff can create orders
    const userRole = event.locals.user?.role;
    if (userRole !== 'admin' && userRole !== 'staff') {
      return json({ message: 'Forbidden: hanya admin dan staff yang dapat membuat order' }, { status: 403 });
    }

    const formData = await event.request.formData();
    
    // Extract order data from form
    const userId = Number(formData.get('userId'));
    const status = formData.get('status') as string || 'pending';
    const shippingMethod = formData.get('shippingMethod') as 'pickup' | 'delivery';
    const paymentMethod = formData.get('paymentMethod') as 'transfer' | 'qris' | 'cash';
    const totalAmount = Number(formData.get('totalAmount'));
    const notes = formData.get('notes') as string || '';
    const orderItemsString = formData.get('orderItems') as string;

    // Parse order items
    let orderItems = [];
    if (orderItemsString) {
      orderItems = JSON.parse(orderItemsString);
    }

    // Validate required fields
    if (!userId || !shippingMethod || !paymentMethod || isNaN(totalAmount)) {
      return json({ message: 'Data order tidak lengkap' }, { status: 400 });
    }

    // Parse and validate order data
    const orderData = {
      userId,
      status,
      shippingMethod,
      paymentMethod,
      totalAmount,
      notes: notes || undefined,
      orderItems
    };

    const parsed = orderSchema.safeParse(orderData);

    if (!parsed.success) {
      return json(
        {
          message: 'Validasi gagal',
          errors: parsed.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const data = parsed.data;

    // Auto-generate order number for the day
    const orderNumber = await getNextOrderNumberForToday();
    
    // Check if order number already exists (shouldn't happen with our logic, but just in case)
    const existing = await getOrderByOrderNumber(orderNumber);
    if (existing) {
      return json({ message: 'Order number sudah terdaftar' }, { status: 400 });
    }

    // Create the order (this will also create the payment record if needed)
    const newOrder = await createOrderService({
      userId: data.userId,
      createdById: event.locals.user?.id,
      orderNumber,
      status: data.status,
      shippingMethod: data.shippingMethod,
      paymentMethod: data.paymentMethod,
      totalAmount: data.totalAmount,
      notes: data.notes,
      orderItems: data.orderItems || [],
    });

    // Process payment proof if provided and payment method is transfer or qris
    const paymentProofFile = formData.get('paymentProofFile') as File | null;
    if (paymentProofFile && (paymentMethod === 'transfer' || paymentMethod === 'qris')) {
      // Get the payment record that was created with the order
      // Use a more specific query to ensure we get the right payment
      const payment = await prisma.payment.findFirst({
        where: { 
          orderId: newOrder.id,
          method: paymentMethod
        },
        orderBy: {
          createdAt: 'desc' // Get the most recently created payment for this order
        }
      });
      
      if (!payment) {
        return json({ message: 'Gagal menemukan record pembayaran untuk order ini' }, { status: 500 });
      }

      // Check if there are existing payment proofs for this payment (in case of retry)
      const existingProofs = await prisma.paymentProof.findMany({
        where: { paymentId: payment.id }
      });
      
      // Delete old files from disk
      for (const proof of existingProofs) {
        try {
          const fullPath = path.join(process.cwd(), 'static', proof.filePath);
          if (fs.existsSync(fullPath)) {
            fs.unlinkSync(fullPath);
          }
        } catch (err) {
          console.error(`Gagal menghapus file bukti pembayaran lama: ${proof.filePath}`, err);
          // Continue even if file deletion fails
        }
      }
      
      // Delete existing payment proofs from database
      await prisma.paymentProof.deleteMany({
        where: { paymentId: payment.id }
      });

      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
      if (!validTypes.includes(paymentProofFile.type)) {
        return json({ message: 'Hanya file gambar (JPG, PNG) atau PDF yang diperbolehkan' }, { status: 400 });
      }

      // Validate file size (max 5MB)
      if (paymentProofFile.size > 5 * 1024 * 1024) {
        return json({ message: 'Ukuran file maksimal 5MB' }, { status: 400 });
      }

      // Upload file using the upload service
      const filePath = await saveFile(Buffer.from(await paymentProofFile.arrayBuffer()), paymentProofFile.name);

      // Create PaymentProof record
      await prisma.paymentProof.create({
        data: {
          paymentId: payment.id,
          fileName: paymentProofFile.name,
          filePath: filePath,
          fileType: paymentProofFile.type,
        }
      });
    }

    return json(newOrder);
  } catch (error) {
    console.error('Error creating order with payment proof:', error);
    return json({ message: 'Gagal membuat order' }, { status: 500 });
  }
}