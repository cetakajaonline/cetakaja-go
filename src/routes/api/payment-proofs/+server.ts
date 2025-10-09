import { json } from '@sveltejs/kit';
import type { RequestEvent } from './$types';
import prisma from '$lib/server/prisma';
import { saveFile } from '$lib/server/uploadService';
import fs from 'fs';
import path from 'path';

export async function POST(event: RequestEvent) {
  try {
    // Only admin and staff can upload payment proofs
    const userRole = event.locals.user?.role;
    if (userRole !== 'admin' && userRole !== 'staff') {
      return json({ message: 'Forbidden: hanya admin dan staff yang dapat upload bukti pembayaran' }, { status: 403 });
    }

    const formData = await event.request.formData();
    const file = formData.get('file') as File | null;
    const paymentId = formData.get('paymentId') as string | null;

    if (!file || !paymentId) {
      return json({ message: 'File dan ID pembayaran wajib disertakan' }, { status: 400 });
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      return json({ message: 'Hanya file gambar (JPG, PNG) atau PDF yang diperbolehkan' }, { status: 400 });
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return json({ message: 'Ukuran file maksimal 5MB' }, { status: 400 });
    }

    // Verify payment exists and belongs to an order
    const payment = await prisma.payment.findUnique({
      where: { id: Number(paymentId) },
      include: { order: true }
    });

    if (!payment) {
      return json({ message: 'Pembayaran tidak ditemukan' }, { status: 404 });
    }

    // Check if there are existing payment proofs for this payment
    const existingProofs = await prisma.paymentProof.findMany({
      where: { paymentId: Number(paymentId) }
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
      where: { paymentId: Number(paymentId) }
    });

    // Upload file using the upload service
    const filePath = await saveFile(Buffer.from(await file.arrayBuffer()), file.name);

    // Create PaymentProof record
    const paymentProof = await prisma.paymentProof.create({
      data: {
        paymentId: Number(paymentId),
        fileName: file.name,
        filePath: filePath,
        fileType: file.type,
      }
    });

    return json({ 
      message: 'Bukti pembayaran berhasil diupload', 
      paymentProof 
    });
  } catch (error) {
    console.error('Error uploading payment proof:', error);
    return json({ message: 'Gagal mengupload bukti pembayaran' }, { status: 500 });
  }
}