// src/routes/(app)/orders/+page.server.ts
import { getAllUsers } from "$lib/server/userService";
import { getAllProducts } from "$lib/server/productService";
import type { User, Product } from "$lib/types";

import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async (event) => {
  const user = event.locals.user;
  if (!user) {
    throw new Error("Unauthorized: user tidak ditemukan");
  }

  // Check if user is admin or staff to view all orders, otherwise only their own orders
  const isAdmin = user.role === "admin";
  const isStaff = user.role === "staff";
  const isCustomer = user.role === "customer";

  // Get users and products for the modal
  let users: User[] = [];
  let products: Product[] = [];

  if (isAdmin || isStaff) {
    users = await getAllUsers();
    products = await getAllProducts();
  }

  return {
    user,
    users,
    products,
    isAdmin,
    isStaff,
    isCustomer,
  };
};
