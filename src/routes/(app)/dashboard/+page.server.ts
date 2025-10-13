// src/routes/(app)/dashboard/+page.server.ts
import { getAllUsers } from "$lib/server/userService";
import { getAllOrders } from "$lib/server/orderService";
import { getAllProducts } from "$lib/server/productService";
import { getAllExpenses } from "$lib/server/expenseService";
import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import prisma from "$lib/server/prisma";
import type { User, Order, Product, Expense, DashboardStats } from "$lib/types";

export const load: PageServerLoad = async ({ locals }) => {
  if (!locals.user) throw redirect(302, "/login");

  // Check if user is admin or staff to load all data, otherwise only customer data
  const isAdmin = locals.user.role === "admin";
  const isStaff = locals.user.role === "staff";
  const isCustomer = locals.user.role === "customer";

  // For customers, only load their own orders and limit access to other data
  let users: User[] = [];
  let orders: Order[] = [];
  let products: Product[] = [];
  let expenses: Expense[] = [];
  let stats: DashboardStats = {
    totalUsers: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    processingOrders: 0,
    finishedOrders: 0,
    canceledOrders: 0,
    monthlyRevenue: [],
    topSellingProducts: [],
    recentOrders: [],
    totalExpenses: 0,
    netRevenue: 0,
  };

  if (isAdmin || isStaff) {
    // Admin and staff can see all data
    [users, orders, products, expenses] = await Promise.all([
      getAllUsers(),
      getAllOrders(),
      getAllProducts(),
      getAllExpenses(),
    ]);

    // Count only customers for total user count
    const customerUsers = users.filter((user) => user.role === "customer");

    // Calculate statistics
    const totalRevenue = orders.reduce(
      (sum, order) => sum + order.totalAmount,
      0,
    );
    const pendingOrders = orders.filter(
      (order) => order.status === "pending",
    ).length;
    const processingOrders = orders.filter(
      (order) => order.status === "processing",
    ).length;
    const finishedOrders = orders.filter(
      (order) => order.status === "finished",
    ).length;
    const canceledOrders = orders.filter(
      (order) => order.status === "canceled",
    ).length;
    const totalExpenses = expenses.reduce(
      (sum, expense) => sum + expense.nominal,
      0,
    );
    const netRevenue = totalRevenue - totalExpenses;

    // Get recent orders (last 5)
    const recentOrders = orders
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )
      .slice(0, 5);

    // Get top selling products
    const productSales = new Map<
      number,
      { name: string; totalSold: number; totalRevenue: number }
    >();

    // Initialize with all products
    for (const product of products) {
      productSales.set(product.id, {
        name: product.name,
        totalSold: 0,
        totalRevenue: 0,
      });
    }

    // Calculate sales for each product
    for (const order of orders) {
      for (const item of order.orderItems) {
        const existing = productSales.get(item.productId);
        if (existing) {
          existing.totalSold += item.qty;
          existing.totalRevenue += item.subtotal;
        }
      }
    }

    // Convert to array and sort by totalSold
    const topSellingProducts: Array<{
      id: number;
      name: string;
      totalSold: number;
      totalRevenue: number;
    }> = Array.from(productSales.entries())
      .map(([id, data]) => ({ id, ...data }))
      .filter((product) => product.totalSold > 0) // Only show products that have sales
      .sort((a, b) => b.totalSold - a.totalSold)
      .slice(0, 5); // Top 5

    // Get monthly revenue for last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyRevenue = await prisma.order.groupBy({
      by: ["createdAt"],
      where: {
        createdAt: {
          gte: sixMonthsAgo,
        },
        status: { not: "canceled" },
      },
      _sum: {
        totalAmount: true,
      },
    });

    // Group by month
    const monthlyRevenueGrouped = new Map<string, number>();
    for (const item of monthlyRevenue) {
      const monthYear = new Date(item.createdAt).toISOString().slice(0, 7); // YYYY-MM
      if (monthlyRevenueGrouped.has(monthYear)) {
        monthlyRevenueGrouped.set(
          monthYear,
          monthlyRevenueGrouped.get(monthYear)! + (item._sum.totalAmount || 0),
        );
      } else {
        monthlyRevenueGrouped.set(monthYear, item._sum.totalAmount || 0);
      }
    }

    // Convert to array of objects for easier use in frontend
    const monthlyRevenueArray = Array.from(monthlyRevenueGrouped.entries())
      .map(([month, total]) => ({ month, total }))
      .sort((a, b) => a.month.localeCompare(b.month));

    stats = {
      totalUsers: customerUsers.length,
      totalOrders: orders.length,
      totalRevenue,
      pendingOrders,
      processingOrders,
      finishedOrders,
      canceledOrders,
      monthlyRevenue: monthlyRevenueArray,
      topSellingProducts,
      recentOrders,
      totalExpenses,
      netRevenue,
    };
  } else if (isCustomer) {
    // For customers, only load their orders
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
            role: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            username: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        orderItems: {
          include: {
            product: { select: { id: true, name: true } },
            variant: { select: { id: true, variantName: true } },
          },
        },
        payments: {
          select: {
            id: true,
            orderId: true,
            userId: true,
            createdById: true,
            method: true,
            amount: true,
            status: true,
            transactionRef: true,
            paidAt: true,
            createdAt: true,
            proofs: {
              select: {
                id: true,
                paymentId: true,
                fileName: true,
                filePath: true,
                fileType: true,
                uploadedAt: true,
              },
            },
          },
        },
      },
    });

    // Calculate customer-specific stats
    const totalRevenue = customerOrders.reduce(
      (sum, order) => sum + order.totalAmount,
      0,
    );
    const pendingOrders = customerOrders.filter(
      (order) => order.status === "pending",
    ).length;
    const processingOrders = customerOrders.filter(
      (order) => order.status === "processing",
    ).length;
    const finishedOrders = customerOrders.filter(
      (order) => order.status === "finished",
    ).length;
    const canceledOrders = customerOrders.filter(
      (order) => order.status === "canceled",
    ).length;

    // Get customer's recent orders (last 5)
    const recentOrders = customerOrders
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )
      .slice(0, 5);

    stats = {
      totalUsers: 1, // Customer only sees their own "user"
      totalOrders: customerOrders.length,
      totalRevenue,
      pendingOrders,
      processingOrders,
      finishedOrders,
      canceledOrders,
      monthlyRevenue: [], // Customer doesn't see overall monthly revenue
      topSellingProducts: [], // Customer doesn't see overall top selling products
      recentOrders,
      totalExpenses: 0, // Customer doesn't see expenses
      netRevenue: totalRevenue, // For customer, net revenue is just their total
    };

    // For customer, only return their data
    users = [locals.user];
    orders = customerOrders;
  }

  return {
    user: locals.user,
    users,
    orders,
    products,
    expenses,
    stats,
  };
};
