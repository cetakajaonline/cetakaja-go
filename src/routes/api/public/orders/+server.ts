// src/routes/api/public/orders/+server.ts
import { json } from "@sveltejs/kit";
import { z } from "zod";
import {
  createOrder,
  getNextOrderNumberForToday,
  getOrderByOrderNumber
} from "$lib/server/orderService";
import { orderSchema } from "$lib/validations/orderSchema";
import prisma from "$lib/server/prisma";
import type { RequestHandler } from "./$types";

export const POST: RequestHandler = async (event) => {
  let phone, status, shippingMethod, paymentMethod, totalAmountStr, notes, orderItemsStr;
  
  try {
    // Check content type to determine how to process the request
    const contentType = event.request.headers.get('content-type');
    if (contentType && contentType.includes('multipart/form-data')) {
      // Handle form data (from client-side fetch with FormData) - this is the expected case
      const formData = await event.request.formData();
      
      phone = formData.get('phone') as string;
      status = formData.get('status') as string;
      shippingMethod = formData.get('shippingMethod') as string;
      paymentMethod = formData.get('paymentMethod') as string;
      totalAmountStr = formData.get('totalAmount') as string;
      notes = formData.get('notes') as string | null;
      orderItemsStr = formData.get('orderItems') as string;
    } else {
      // Handle JSON data - in case someone calls the endpoint directly with JSON
      const jsonData = await event.request.json();
      phone = jsonData.phone;
      status = jsonData.status;
      shippingMethod = jsonData.shippingMethod;
      paymentMethod = jsonData.paymentMethod;
      totalAmountStr = jsonData.totalAmount;
      notes = jsonData.notes;
      orderItemsStr = JSON.stringify(jsonData.orderItems || []);
    }
  } catch (parseError) {
    // Handle parsing errors specifically
    if (parseError instanceof SyntaxError) {
      return json({ message: "Format data tidak valid" }, { status: 400 });
    }
    // Re-throw if it's a different type of error
    throw parseError;
  }

  try {
    // Parse orderItems which is sent as stringified JSON inside form data
    let orderItems = [];
    if (orderItemsStr) {
      try {
        orderItems = JSON.parse(orderItemsStr);
      } catch {
        return json({ message: "Format order items tidak valid" }, { status: 400 });
      }
    }

    // Create a schema for public order creation with phone number
    const publicOrderByPhoneSchema = orderSchema.extend({
      phone: z.string().min(10).max(15).regex(/^08\d+$/, "Nomor telepon harus diawali dengan 08 dan hanya berisi angka"),
      userId: z.number().optional(), // userId will be set internally based on phone number
    });
    
    const parsed = publicOrderByPhoneSchema.safeParse({
      phone,
      status: status || 'pending',
      shippingMethod: shippingMethod || 'pickup',
      paymentMethod: paymentMethod || 'cash',
      totalAmount: typeof totalAmountStr === 'string' ? parseInt(totalAmountStr, 10) : (totalAmountStr || 0),
      notes: notes || undefined,
      orderItems,
      userId: undefined // Ensure userId is undefined so we look up by phone
    });

    if (!parsed.success) {
      return json(
        {
          message: "Validasi gagal",
          errors: parsed.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const data = parsed.data;
    
    // Find user by phone number
    const user = await prisma.user.findUnique({
      where: {
        phone: data.phone
      }
    });
    
    if (!user) {
      return json({ message: "User tidak ditemukan" }, { status: 404 });
    }

    // Auto-generate order number for the day
    const orderNumber = await getNextOrderNumberForToday();

    // Check if order number already exists (shouldn't happen with our logic, but just in case)
    const existing = await getOrderByOrderNumber(orderNumber);
    if (existing) {
      return json({ message: "Order number sudah terdaftar" }, { status: 400 });
    }

    // Create the public order associated with the found user
    const newOrder = await createOrder({
      userId: user.id, // Use the user found by phone number
      createdById: user.id, // For public orders from OrderWizard, set createdById to the same as userId
      orderNumber,
      status: data.status,
      shippingMethod: data.shippingMethod,
      paymentMethod: data.paymentMethod,
      totalAmount: data.totalAmount,
      notes: data.notes || undefined,
      orderItems: data.orderItems || [],
    });

    return json(newOrder);
  } catch (error) {
    console.error('Error creating public order by phone:', error);
    return json({ message: "Gagal membuat order" }, { status: 500 });
  }
};