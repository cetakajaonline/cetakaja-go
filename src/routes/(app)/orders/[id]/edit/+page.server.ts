// src/routes/(app)/orders/[id]/edit/+page.server.ts
import { getOrderById } from "$lib/server/orderService";
import { getAllUsers } from "$lib/server/userService";
import { getAllProducts } from "$lib/server/productService";

export const load = async (event: any) => {
  const id = Number(event.params.id);
  const user = event.locals.user;

  if (!user) {
    throw new Error("Unauthorized: user tidak ditemukan");
  }

  // Only admin and staff can edit orders
  if (user.role !== "admin" && user.role !== "staff") {
    throw new Error(
      "Forbidden: hanya admin dan staff yang dapat mengedit order",
    );
  }

  const order = await getOrderById(id);
  if (!order) {
    throw new Error("Order tidak ditemukan");
  }

  // Check if user can edit this order (for more granular permissions)
  // For now we allow admin/staff to edit any order

  const users = await getAllUsers();
  const products = await getAllProducts();

  return {
    order,
    users,
    products,
    user,
  };
};
