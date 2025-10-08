// src/routes/(app)/orders/+page.server.ts
import { getAllOrders, getOrdersByUserId } from "$lib/server/orderService";
import { getAllUsers } from "$lib/server/userService";
import { getAllProducts } from "$lib/server/productService";
import type { Order, User, Product } from "$lib/types";

export const load = async (event) => {
  const user = event.locals.user;
  if (!user) {
    throw new Error("Unauthorized: user tidak ditemukan");
  }

  // Check if user is admin or staff to view all orders, otherwise only their own orders
  const isAdmin = user.role === "admin";
  const isStaff = user.role === "staff";
  const isCustomer = user.role === "customer";

  let orders: Order[] = [];

  if (isAdmin || isStaff) {
    // Admin and staff can view all orders
    orders = await getAllOrders();
  } else if (isCustomer) {
    // Customer can only view their own orders
    orders = await getOrdersByUserId(user.id);
  }

  // Get users and products for the modal
  let users: User[] = [];
  let products: Product[] = [];

  if (isAdmin || isStaff) {
    users = await getAllUsers();
    products = await getAllProducts();
  }

  return {
    orders,
    user,
    users,
    products,
    isAdmin,
    isStaff,
    isCustomer,
  };
};
