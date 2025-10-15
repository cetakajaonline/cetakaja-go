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

  // Only load extensive data for admin and staff users
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
      isCustomer: false, // Not a customer since it's admin/staff
    };
  }

  // For customer users, only load orders related to the customer
  if (locals.user.role === "customer") {
    const customerOrders = await prisma.order.findMany({
      where: { userId: locals.user.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            phone: true,
            address: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            username: true,
          },
        },
        orderItems: {
          include: {
            product: { select: { id: true, name: true } },
          },
        },
        payments: {
          select: {
            id: true,
            method: true,
            amount: true,
            status: true,
            transactionRef: true,
            paidAt: true,
          },
        },
      },
    });

    return {
      user: locals.user,
      setting: {
        name: settings?.name ?? "Aplikasi",
        description: settings?.description ?? "",
        logo: settings?.logo ?? null,
      },
      orders: customerOrders,
      isAdmin: false, // Not an admin since it's a customer
      isStaff: false, // Not a staff since it's a customer
      isCustomer: true,
    };
  }

  // For other roles or fallback
  return {
    user: locals.user,
    setting: {
      name: settings?.name ?? "Aplikasi",
      description: settings?.description ?? "",
      logo: settings?.logo ?? null,
    },
    isAdmin: locals.user.role === "admin",
    isStaff: locals.user.role === "staff",
    isCustomer: locals.user.role === "customer",
  };
};
