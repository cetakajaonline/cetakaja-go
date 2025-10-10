import { json } from "@sveltejs/kit";
import type { RequestEvent } from "./$types";
import prisma from "$lib/server/prisma";

export async function GET(event: RequestEvent) {
  try {
    const { searchParams } = new URL(event.request.url);
    const orderId = searchParams.get("orderId");

    if (!orderId) {
      return json({ message: "Order ID wajib disertakan" }, { status: 400 });
    }

    // Check if user is authorized to access this order's payments
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

    // Get payments for this order
    const payments = await prisma.payment.findMany({
      where: { orderId: Number(orderId) },
    });

    return json(payments);
  } catch (error) {
    console.error("Error fetching payments:", error);
    return json(
      { message: "Gagal mengambil data pembayaran" },
      { status: 500 },
    );
  }
}

