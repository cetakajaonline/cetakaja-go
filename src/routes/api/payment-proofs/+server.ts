import { json } from "@sveltejs/kit";
import type { RequestEvent } from "./$types";
import prisma from "$lib/server/prisma";
import { savePaymentFile } from "$lib/server/uploadService";
import fs from "fs";
import path from "path";

export async function POST(event: RequestEvent) {
  try {
    const formData = await event.request.formData();
    const file = formData.get("file") as File | null;
    const paymentId = formData.get("paymentId") as string | null;

    if (!paymentId) {
      return json(
        { message: "ID pembayaran wajib disertakan" },
        { status: 400 },
      );
    }

    if (!file) {
      return json(
        { message: "File bukti pembayaran wajib disertakan" },
        { status: 400 },
      );
    }

    // Verify payment exists and belongs to an order
    const payment = await prisma.payment.findUnique({
      where: { id: Number(paymentId) },
      include: { 
        order: {
          select: { userId: true }
        }
      },
    });

    if (!payment) {
      return json({ message: "Pembayaran tidak ditemukan" }, { status: 404 });
    }

    // Check if user is authenticated and authorized
    const userId = event.locals.user?.id;
    const userRole = event.locals.user?.role;
    
    // Allow access if user is admin/staff or if it's the user's own order
    if (
      userRole !== "admin" && 
      userRole !== "staff" && 
      userId !== payment.order.userId
    ) {
      return json(
        {
          message:
            "Forbidden: hanya admin, staff, atau pemilik order yang dapat upload bukti pembayaran",
        },
        { status: 403 },
      );
    }

    // Validate file type
    const validTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "application/pdf",
    ];
    if (!validTypes.includes(file.type)) {
      return json(
        { message: "Hanya file gambar (JPG, PNG) atau PDF yang diperbolehkan" },
        { status: 400 },
      );
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return json({ message: "Ukuran file maksimal 5MB" }, { status: 400 });
    }

    // Check if there are existing payment proofs for this payment
    const existingProofs = await prisma.paymentProof.findMany({
      where: { paymentId: Number(paymentId) },
    });

    // Delete old files from disk
    for (const proof of existingProofs) {
      try {
        const fullPath = path.join(process.cwd(), "static", proof.filePath);
        if (fs.existsSync(fullPath)) {
          fs.unlinkSync(fullPath);
        }
      } catch (err) {
        console.error(
          `Gagal menghapus file bukti pembayaran lama: ${proof.filePath}`,
          err,
        );
        // Continue even if file deletion fails
      }
    }

    // Delete existing payment proofs from database
    await prisma.paymentProof.deleteMany({
      where: { paymentId: Number(paymentId) },
    });

    // Upload file using the payment upload service
    const filePath = await savePaymentFile(
      Buffer.from(await file.arrayBuffer()),
      file.name,
    );

    // Create PaymentProof record
    const paymentProof = await prisma.paymentProof.create({
      data: {
        paymentId: Number(paymentId),
        fileName: file.name,
        filePath: filePath,
        fileType: file.type,
      },
    });

    return json({
      message: "Bukti pembayaran berhasil diupload",
      paymentProof,
    });
  } catch (error) {
    console.error("Error uploading payment proof:", error);
    return json(
      { message: "Gagal mengupload bukti pembayaran" },
      { status: 500 },
    );
  }
}

export async function DELETE(event: RequestEvent) {
  try {
    // Only admin and staff can delete payment proofs
    const userRole = event.locals.user?.role;
    if (userRole !== "admin" && userRole !== "staff") {
      return json(
        {
          message:
            "Forbidden: hanya admin dan staff yang dapat menghapus bukti pembayaran",
        },
        { status: 403 },
      );
    }

    const paymentProofId = Number(event.url.searchParams.get("id"));

    if (!paymentProofId) {
      return json(
        { message: "ID bukti pembayaran wajib disertakan" },
        { status: 400 },
      );
    }

    // Get the payment proof to access the file path before deletion
    const paymentProof = await prisma.paymentProof.findUnique({
      where: { id: paymentProofId },
    });

    if (!paymentProof) {
      return json(
        { message: "Bukti pembayaran tidak ditemukan" },
        { status: 404 },
      );
    }

    // Delete the file from disk
    try {
      const fullPath = path.join(
        process.cwd(),
        "static",
        paymentProof.filePath,
      );
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }
    } catch (err) {
      console.error(
        `Gagal menghapus file bukti pembayaran: ${paymentProof.filePath}`,
        err,
      );
      // Continue with database deletion even if file deletion fails
    }

    // Delete the payment proof from database
    await prisma.paymentProof.delete({
      where: { id: paymentProofId },
    });

    return json({
      message: "Bukti pembayaran berhasil dihapus",
    });
  } catch (error) {
    console.error("Error deleting payment proof:", error);
    return json(
      { message: "Gagal menghapus bukti pembayaran" },
      { status: 500 },
    );
  }
}
