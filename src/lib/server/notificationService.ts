import prisma from "$lib/server/prisma";
import type { User, Order } from "$lib/types";

interface CreateNotificationData {
  userId: number;
  orderId?: number;
  toNumber: string;
  message: string;
  status?: "pending" | "sent" | "failed";
}

// Helper function to format Indonesian phone numbers to international format
function formatToInternational(phone: string): string {
  // Remove any non-digit characters
  const cleaned = phone.replace(/\D/g, "");

  // If starts with '0', replace with '62'
  if (cleaned.startsWith("0")) {
    return "62" + cleaned.substring(1);
  }
  // If starts with '+62', remove the '+' and return
  else if (phone.includes("+62")) {
    return cleaned;
  }
  // If already starts with '62', return as is
  else if (cleaned.startsWith("62")) {
    return cleaned;
  }
  // For other formats, return as is but you might want to add validation
  else {
    return cleaned;
  }
}

export async function createNotification(data: CreateNotificationData) {
  const formattedToNumber = formatToInternational(data.toNumber);

  const notification = await prisma.notification.create({
    data: {
      userId: data.userId,
      orderId: data.orderId,
      toNumber: formattedToNumber,
      message: data.message,
      status: data.status || "pending",
    },
  });

  return notification;
}

export async function createOrderNotification(order: Order, user: User) {
  // Create notification based on order status
  let message = "";

  switch (order.status) {
    case "pending":
      message = `Halo ${user.name}, pesanan Anda dengan nomor ${order.orderNumber} telah diterima dan sedang diproses.`;
      break;
    case "processing":
      message = `Halo ${user.name}, pesanan Anda dengan nomor ${order.orderNumber} sedang dalam proses pengemasan.`;
      break;
    case "finished":
      message = `Halo ${user.name}, pesanan Anda dengan nomor ${order.orderNumber} telah selesai. Terima kasih telah berbelanja!`;
      break;
    case "canceled":
      message = `Halo ${user.name}, pesanan Anda dengan nomor ${order.orderNumber} telah dibatalkan.`;
      break;
    default:
      // No notification for unknown status
      return null;
  }

  if (message) {
    const notification = await createNotification({
      userId: order.userId,
      orderId: order.id,
      toNumber: user.phone, // Using the user's phone number from the User table
      message: message,
      status: "pending",
    });

    return notification;
  }

  return null;
}

export async function createPaymentNotification(
  order: Order,
  user: User,
  paymentStatus: string,
) {
  let message = "";

  switch (paymentStatus) {
    case "pending":
      message = `Halo ${user.name}, pembayaran untuk pesanan ${order.orderNumber} sedang menunggu konfirmasi.`;
      break;
    case "confirmed":
      message = `Halo ${user.name}, pembayaran untuk pesanan ${order.orderNumber} telah dikonfirmasi. Pesanan Anda akan segera diproses.`;
      break;
    case "failed":
      message = `Halo ${user.name}, pembayaran untuk pesanan ${order.orderNumber} gagal. Silakan hubungi kami untuk bantuan.`;
      break;
    case "refunded":
      message = `Halo ${user.name}, pembayaran untuk pesanan ${order.orderNumber} telah dikembalikan.`;
      break;
    default:
      return null;
  }

  if (message) {
    const notification = await createNotification({
      userId: order.userId,
      orderId: order.id,
      toNumber: user.phone,
      message: message,
      status: "pending",
    });

    return notification;
  }

  return null;
}

export async function getPendingNotifications() {
  return await prisma.notification.findMany({
    where: {
      status: "pending",
    },
    include: {
      user: true,
      order: true,
    },
    orderBy: {
      sentAt: "asc",
    },
  });
}

export async function updateNotificationStatus(
  id: number,
  status: "sent" | "failed",
) {
  return await prisma.notification.update({
    where: { id },
    data: { status, sentAt: new Date() },
  });
}

