// src/routes/api/orders/+server.ts
import { json } from "@sveltejs/kit";
import {
  getAllOrders,
  createOrder,
  getOrderByOrderNumber,
} from "$lib/server/orderService";
import { orderSchema } from "$lib/validations/orderSchema";

export async function GET(event) {
  try {
    // Anyone authenticated can view orders
    if (!event.locals.user) {
      throw new Error("Unauthorized: user tidak ditemukan");
    }

    const orders = await getAllOrders();
    return json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    return json({ message: "Gagal mengambil data orders" }, { status: 500 });
  }
}

export async function POST(event) {
  try {
    // Only admin and staff can create orders
    const userRole = event.locals.user?.role;
    if (userRole !== "admin" && userRole !== "staff") {
      throw new Error(
        "Forbidden: hanya admin dan staff yang dapat membuat order",
      );
    }

    const body = await event.request.json();
    const parsed = orderSchema.safeParse(body);

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

    // Check if order number already exists
    const existing = await getOrderByOrderNumber(data.orderNumber);
    if (existing) {
      return json({ message: "Order number sudah terdaftar" }, { status: 400 });
    }

    const newOrder = await createOrder({
      userId: data.userId,
      createdById: event.locals.user?.id,
      orderNumber: data.orderNumber,
      status: data.status,
      shippingMethod: data.shippingMethod,
      shippingAddress: data.shippingAddress,
      paymentMethod: data.paymentMethod,
      totalAmount: data.totalAmount,
      orderItems: data.orderItems || [],
    });

    return json(newOrder);
  } catch (error) {
    console.error("Error creating order:", error);
    return json({ message: "Gagal membuat order" }, { status: 500 });
  }
}
