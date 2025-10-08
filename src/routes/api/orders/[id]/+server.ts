// src/routes/api/orders/[id]/+server.ts
import { json } from "@sveltejs/kit";
import {
  updateOrder,
  deleteOrder,
  getOrderById,
} from "$lib/server/orderService";
import { orderUpdateSchema } from "$lib/validations/orderSchema";

export async function PUT(event) {
  try {
    const id = Number(event.params.id);

    // Only admin and staff can update orders
    const userRole = event.locals.user?.role;
    if (userRole !== "admin" && userRole !== "staff") {
      throw new Error(
        "Forbidden: hanya admin dan staff yang dapat mengupdate order",
      );
    }

    const body = await event.request.json();
    const parsed = orderUpdateSchema.safeParse(body);

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

    const updated = await updateOrder(id, {
      ...data,
      // Only update createdById if provided in the request (for admin use)
      ...(data.createdById !== undefined && { createdById: data.createdById }),
    });

    return json(updated);
  } catch (error) {
    console.error("Error updating order:", error);
    return json({ message: "Gagal mengupdate order" }, { status: 500 });
  }
}

export async function DELETE(event) {
  try {
    const id = Number(event.params.id);

    // Only admin can delete orders
    if (event.locals.user?.role !== "admin") {
      throw new Error("Forbidden: hanya admin yang dapat menghapus order");
    }

    await deleteOrder(id);
    return json({ message: "Berhasil menghapus order" });
  } catch (error) {
    console.error("Error deleting order:", error);
    return json({ message: "Gagal menghapus order" }, { status: 500 });
  }
}

export async function GET(event) {
  try {
    const id = Number(event.params.id);

    // Check if user can access this order (admin/staff or the order owner)
    const order = await getOrderById(id);
    if (!order) {
      return json({ message: "Order tidak ditemukan" }, { status: 404 });
    }

    // Allow access if user is admin/staff or if user owns the order
    const user = event.locals.user;
    if (!user) {
      return json({ message: "Unauthorized" }, { status: 401 });
    }

    if (
      user.role === "admin" ||
      user.role === "staff" ||
      user.id === order.userId
    ) {
      return json(order);
    }

    return json(
      { message: "Forbidden: Anda tidak diizinkan mengakses order ini" },
      { status: 403 },
    );
  } catch (error) {
    console.error("Error fetching order:", error);
    return json({ message: "Gagal mengambil data order" }, { status: 500 });
  }
}
