// src/routes/(app)/+layout.server.ts
import { redirect } from "@sveltejs/kit";
import prisma from "$lib/server/prisma";
import type { LayoutServerLoad } from "./$types";
import { getAllExpenses } from "$lib/server/expenseService";
import { getAllOrders } from "$lib/server/orderService";
import { getAllProducts } from "$lib/server/productService";

export const load: LayoutServerLoad = async ({ locals }) => {
  // Redirect jika belum login
  if (!locals.user) {
    throw redirect(302, "/login");
  }

  // Ambil setting sekali saja
  const settings = await prisma.setting.findFirst({
    select: {
      name: true,
      description: true,
      logo: true,
    },
  });

  // Only load data for admin and staff users
  if (locals.user.role === "admin" || locals.user.role === "staff") {
    // Fetch data for all entities
    const [expenses, orders, products] = await Promise.all([
      getAllExpenses(),
      getAllOrders(),
      getAllProducts(),
    ]);

    return {
      user: locals.user,
      setting: {
        name: settings?.name ?? "Aplikasi",
        description: settings?.description ?? "",
        logo: settings?.logo ?? null,
      },
      expenses,
      orders,
      products,
      isAdmin: locals.user.role === "admin",
      isStaff: locals.user.role === "staff",
    };
  }

  return {
    user: locals.user,
    setting: {
      name: settings?.name ?? "Aplikasi",
      description: settings?.description ?? "",
      logo: settings?.logo ?? null,
    },
    isAdmin: locals.user.role === "admin",
    isStaff: locals.user.role === "staff",
  };
};
