// src/routes/api/orders/+server.ts
import { json, type RequestEvent } from "@sveltejs/kit";
import {
  getAllOrders,
  createOrder,
  getOrderByOrderNumber,
  getNextOrderNumberForToday,
  getOrdersByUserId,
} from "$lib/server/orderService";
import { orderSchema } from "$lib/validations/orderSchema";

export async function GET(event: RequestEvent) {
  try {
    // Anyone authenticated can view orders
    if (!event.locals.user) {
      throw new Error("Unauthorized: user tidak ditemukan");
    }

    let orders;
    const userRole = event.locals.user.role;
    const userId = event.locals.user.id;

    // If user is customer, only return their orders
    if (userRole === "customer") {
      orders = await getOrdersByUserId(userId);
    } else {
      // Admin and staff can see all orders
      orders = await getAllOrders();
    }

    return json(orders);
  } catch {
    return json({ message: "Gagal mengambil data orders" }, { status: 500 });
  }
}

export async function POST(event: RequestEvent) {
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

    // Auto-generate order number for the day
    const orderNumber = await getNextOrderNumberForToday();

    // Check if order number already exists (shouldn't happen with our logic, but just in case)
    const existing = await getOrderByOrderNumber(orderNumber);
    if (existing) {
      return json({ message: "Order number sudah terdaftar" }, { status: 400 });
    }

    const newOrder = await createOrder({
      userId: data.userId,
      createdById: event.locals.user?.id,
      orderNumber,
      status: data.status,
      shippingMethod: data.shippingMethod,
      paymentMethod: data.paymentMethod,
      totalAmount: data.totalAmount,
      notes: data.notes || undefined,
      orderItems: (data.orderItems || []).map((item) => ({
        productId: item.productId,
        qty: item.qty,
        price: item.price,
        subtotal: item.subtotal,
        notes: item.notes,
        options: item.options || [],
      })),
    });

    return json(newOrder);
  } catch {
    return json({ message: "Gagal membuat order" }, { status: 500 });
  }
}
