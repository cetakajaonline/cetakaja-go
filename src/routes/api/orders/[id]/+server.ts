// src/routes/api/orders/[id]/+server.ts
import { json, type RequestEvent } from "@sveltejs/kit";
import {
  updateOrder,
  deleteOrder,
  getOrderWithPayments,
} from "$lib/server/orderService";
import { orderUpdateSchema } from "$lib/validations/orderSchema";

export async function PUT(event: RequestEvent) {
  try {
    const id = Number(event.params.id);
    const user = event.locals.user;

    if (!user) {
      throw new Error("Unauthorized: user tidak ditemukan");
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

    // Check if user is admin or staff - they can update anything
    const isAdminOrStaff = user.role === "admin" || user.role === "staff";

    if (isAdminOrStaff) {
      // Admin and staff can update any order fields
      const updated = await updateOrder(id, {
        ...data,
        // Only update createdById if provided in the request (for admin use)
        ...(data.createdById !== undefined && {
          createdById: data.createdById,
        }),
      });
      return json(updated);
    } else if (user.role === "customer") {
      // Customer can only update status to 'canceled' for their own orders
      if (Object.keys(data).length !== 1 || data.status !== "canceled") {
        throw new Error(
          "Forbidden: customer hanya dapat mengupdate status order miliknya ke 'canceled'",
        );
      }

      // Verify that the order belongs to the customer
      const order = await getOrderWithPayments(id);
      if (!order) {
        return json({ message: "Order tidak ditemukan" }, { status: 404 });
      }

      if (order.userId !== user.id) {
        throw new Error("Forbidden: Anda tidak diizinkan mengupdate order ini");
      }

      // Allow status update to 'canceled' if current status is 'pending' or 'processing'
      if (order.status !== "pending" && order.status !== "processing") {
        throw new Error(
          "Forbidden: Status order tidak dapat dibatalkan karena status saat ini bukan 'pending' atau 'processing'",
        );
      }

      const updated = await updateOrder(id, { status: "canceled" });
      return json(updated);
    } else {
      // Any other role is forbidden
      throw new Error("Forbidden: role tidak diizinkan untuk mengupdate order");
    }
  } catch (error) {
    console.error("Error updating order:", error);
    return json({ message: "Gagal mengupdate order" }, { status: 500 });
  }
}

export async function DELETE(event: RequestEvent) {
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

export async function GET(event: RequestEvent) {
  try {
    const id = Number(event.params.id);

    // Check if user can access this order (admin/staff or the order owner)
    const order = await getOrderWithPayments(id);
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
