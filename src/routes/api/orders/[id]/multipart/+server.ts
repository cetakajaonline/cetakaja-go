import { json, type RequestEvent } from "@sveltejs/kit";
import prisma from "$lib/server/prisma";
import { orderUpdateSchema } from "$lib/validations/orderSchema";
import { updateOrder } from "$lib/server/orderService";
import { savePaymentFile } from "$lib/server/uploadService";
import { createPaymentNotification } from "$lib/server/notificationService";
import fs from "node:fs";
import path from "node:path";

export async function PUT(event: RequestEvent) {
  try {
    const id = Number(event.params.id);

    // Only admin and staff can update orders
    const userRole = event.locals.user?.role;
    if (userRole !== "admin" && userRole !== "staff") {
      return json(
        {
          message:
            "Forbidden: hanya admin dan staff yang dapat mengupdate order",
        },
        { status: 403 },
      );
    }

    const formData = await event.request.formData();

    // Extract order data from form
    const userId = formData.get("userId")
      ? Number(formData.get("userId"))
      : undefined;
    const orderNumber = formData.get("orderNumber") as string | undefined;
    const status = formData.get("status") as
      | "pending"
      | "processing"
      | "finished"
      | "canceled"
      | undefined;
    const shippingMethod = formData.get("shippingMethod") as
      | "pickup"
      | "delivery"
      | undefined;
    const paymentMethod = formData.get("paymentMethod") as
      | "transfer"
      | "qris"
      | "cash"
      | undefined;
    const paymentStatus = formData.get("paymentStatus") as
      | "pending"
      | "confirmed"
      | "failed"
      | "refunded"
      | undefined;
    const totalAmount = formData.get("totalAmount")
      ? Number(formData.get("totalAmount"))
      : undefined;
    const notes = formData.get("notes") as string | undefined;
    const createdById = formData.get("createdById")
      ? Number(formData.get("createdById"))
      : undefined;
    const orderItemsString = formData.get("orderItems") as string | undefined;

    // Parse order items if provided
    let orderItems;
    if (orderItemsString) {
      orderItems = JSON.parse(orderItemsString);
    }

    // Validate data using the update schema
    const orderData = {
      userId,
      orderNumber,
      status,
      shippingMethod,
      paymentMethod,
      paymentStatus,
      totalAmount,
      notes,
      orderItems,
      createdById,
    };

    const parsed = orderUpdateSchema.safeParse(orderData);

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

    // Update the order
    const updatedOrder = await updateOrder(id, {
      ...data,
      // Only update createdById if provided in the request (for admin use)
      ...(data.createdById !== undefined && { createdById: data.createdById }),
      // Transform orderItems if they were provided to include options instead of variantId
      ...(data.orderItems && {
        orderItems: data.orderItems.map((item) => ({
          productId: item.productId,
          qty: item.qty,
          price: item.price,
          subtotal: item.subtotal,
          notes: item.notes,
          options: item.options || [],
        })),
      }),
    });

    // Process payment proof if provided and payment method is transfer or qris
    const paymentProofFile = formData.get("paymentProofFile") as File | null;
    if (paymentProofFile) {
      // Determine the payment method to use for finding the payment record
      const targetPaymentMethod = paymentMethod || updatedOrder.paymentMethod;

      if (
        targetPaymentMethod === "transfer" ||
        targetPaymentMethod === "qris"
      ) {
        // Get the payment record for this order
        // If payment method is being updated, look for existing payments for this order
        // If payment method is not changing, use the current payment method
        const payment = await prisma.payment.findFirst({
          where: { orderId: id },
          orderBy: {
            createdAt: "desc", // Get the most recently created payment for this order
          },
        });

        if (!payment) {
          // If no payment exists yet for this order, create one first
          const newPayment = await prisma.payment.create({
            data: {
              orderId: id,
              userId: updatedOrder.userId,
              createdById: updatedOrder.createdById,
              method: targetPaymentMethod,
              amount: totalAmount || updatedOrder.totalAmount,
              status: paymentStatus || "pending",
            },
          });

          // Create payment notification for the new payment
          const user = await prisma.user.findUnique({
            where: { id: updatedOrder.userId },
          });
          if (user) {
            // For cash payments, status should be "pending" since payment happens later
            const paymentStatusForNotification =
              (targetPaymentMethod as "transfer" | "qris" | "cash") === "cash"
                ? "pending"
                : newPayment.status;
            await createPaymentNotification(
              updatedOrder,
              user,
              paymentStatusForNotification,
            );
          }

          // Validate file type
          const validTypes = [
            "image/jpeg",
            "image/jpg",
            "image/png",
            "application/pdf",
          ];
          if (!validTypes.includes(paymentProofFile.type)) {
            return json(
              {
                message:
                  "Hanya file gambar (JPG, PNG) atau PDF yang diperbolehkan",
              },
              { status: 400 },
            );
          }

          // Validate file size (max 5MB)
          if (paymentProofFile.size > 5 * 1024 * 1024) {
            return json(
              { message: "Ukuran file maksimal 5MB" },
              { status: 400 },
            );
          }

          // Upload file using the upload service
          const filePath = await savePaymentFile(
            Buffer.from(await paymentProofFile.arrayBuffer()),
            paymentProofFile.name,
          );

          // Create PaymentProof record
          await prisma.paymentProof.create({
            data: {
              paymentId: newPayment.id,
              fileName: paymentProofFile.name,
              filePath: filePath,
              fileType: paymentProofFile.type,
            },
          });
        } else {
          // Payment exists, update its details if needed
          await prisma.payment.update({
            where: { id: payment.id },
            data: {
              method: targetPaymentMethod,
              amount: totalAmount || updatedOrder.totalAmount,
              status: paymentStatus || payment.status,
            },
          });

          // Check if there are existing payment proofs for this payment
          const existingProofs = await prisma.paymentProof.findMany({
            where: { paymentId: payment.id },
          });

          // Delete old files from disk
          for (const proof of existingProofs) {
            try {
              const fullPath = path.join(
                process.cwd(),
                "static",
                proof.filePath,
              );
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
            where: { paymentId: payment.id },
          });

          // Validate file type
          const validTypes = [
            "image/jpeg",
            "image/jpg",
            "image/png",
            "application/pdf",
          ];
          if (!validTypes.includes(paymentProofFile.type)) {
            return json(
              {
                message:
                  "Hanya file gambar (JPG, PNG) atau PDF yang diperbolehkan",
              },
              { status: 400 },
            );
          }

          // Validate file size (max 5MB)
          if (paymentProofFile.size > 5 * 1024 * 1024) {
            return json(
              { message: "Ukuran file maksimal 5MB" },
              { status: 400 },
            );
          }

          // Upload file using the upload service
          const filePath = await savePaymentFile(
            Buffer.from(await paymentProofFile.arrayBuffer()),
            paymentProofFile.name,
          );

          // Create new PaymentProof record
          await prisma.paymentProof.create({
            data: {
              paymentId: payment.id,
              fileName: paymentProofFile.name,
              filePath: filePath,
              fileType: paymentProofFile.type,
            },
          });
        }
      } else {
        return json(
          {
            message:
              "Payment proof hanya bisa diupload untuk metode transfer atau qris",
          },
          { status: 400 },
        );
      }
    }

    return json(updatedOrder);
  } catch (error) {
    console.error("Error updating order with payment proof:", error);
    return json({ message: "Gagal mengupdate order" }, { status: 500 });
  }
}
