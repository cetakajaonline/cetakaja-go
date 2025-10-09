import { json } from "@sveltejs/kit";
import type { RequestEvent } from "./$types";
import prisma from "$lib/server/prisma";

export async function GET(event: RequestEvent) {
  try {
    const orderId = event.params.id;

    // Check if user is authorized to access this order
    const userRole = event.locals.user?.role;
    const order = await prisma.order.findUnique({
      where: { id: Number(orderId) },
      select: { userId: true },
    });

    if (!order) {
      return json({ message: "Order tidak ditemukan" }, { status: 404 });
    }

    // Allow access if user is admin/staff or if it's the user's own order
    if (
      userRole !== "admin" &&
      userRole !== "staff" &&
      event.locals.user?.id !== order.userId
    ) {
      return json({ message: "Unauthorized" }, { status: 401 });
    }

    // Get payment for this order
    const payment = await prisma.payment.findFirst({
      where: { orderId: Number(orderId) },
    });

    if (!payment) {
      return json(
        { message: "Payment tidak ditemukan untuk order ini" },
        { status: 404 },
      );
    }

    return json(payment);
  } catch (error) {
    console.error("Error fetching payment:", error);
    return json(
      { message: "Gagal mengambil data pembayaran" },
      { status: 500 },
    );
  }
}
