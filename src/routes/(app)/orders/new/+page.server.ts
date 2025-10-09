// src/routes/(app)/orders/new/+page.server.ts
import { getAllUsers } from "$lib/server/userService";
import { getAllProducts } from "$lib/server/productService";

export const load = async (event: any) => {
  const user = event.locals.user;

  if (!user) {
    throw new Error("Unauthorized: user tidak ditemukan");
  }

  // Only admin and staff can create orders
  if (user.role !== "admin" && user.role !== "staff") {
    throw new Error(
      "Forbidden: hanya admin dan staff yang dapat membuat order",
    );
  }

  const users = await getAllUsers();
  const products = await getAllProducts();

  return {
    users,
    products,
    user,
  };
};
