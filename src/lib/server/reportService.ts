import prisma from "$lib/server/prisma";
import type {
  DailyReportData,
  WeeklyReportData,
  MonthlyReportData,
} from "$lib/types";

/**
 * Gets daily report data for the specified date.
 *
 * @param targetDate The date to get report data for
 * @returns Daily report data
 */
export async function getDailyReport(
  targetDate: Date,
): Promise<DailyReportData> {
  // Calculate date range for the selected day (from 00:00:00 to 23:59:59) in local timezone
  const startDate = new Date(
    targetDate.getFullYear(),
    targetDate.getMonth(),
    targetDate.getDate(),
    0,
    0,
    0,
    0,
  );
  const endDate = new Date(
    targetDate.getFullYear(),
    targetDate.getMonth(),
    targetDate.getDate() + 1,
    0,
    0,
    0,
    -1,
  );

  // Fetch orders and related data separately to avoid relationship issues
  const [orders, orderItems, expenses] = await Promise.all([
    // Fetch orders for the selected date
    prisma.order.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lt: endDate,
        },
      },
      include: {
        user: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    }),

    // Fetch order items for those dates by using a subquery with order IDs
    prisma.orderItem.findMany({
      where: {
        order: {
          createdAt: {
            gte: startDate,
            lt: endDate,
          },
        },
      },
      include: {
        product: true,
        variant: true,
      },
    }),

    // Fetch expenses for the selected date
    prisma.expense.findMany({
      where: {
        date: {
          gte: startDate,
          lt: endDate,
        },
      },
    }),
  ]);

  // Group orderItems by order ID for efficient processing
  const orderItemsMap: Record<number, typeof orderItems> = {};
  orderItems.forEach((item: (typeof orderItems)[number]) => {
    const orderId = item.orderId; // Using the foreign key directly
    if (!orderItemsMap[orderId]) {
      orderItemsMap[orderId] = [];
    }
    orderItemsMap[orderId].push(item);
  });

  // Calculate report metrics
  const totalOrders = orders.length;
  // Only count revenue from orders with confirmed payments (not pending, failed, or refunded)
  const totalRevenue = orders
    .filter((order) => order.paymentStatus === "confirmed")
    .reduce(
      (sum: number, order: (typeof orders)[number]) => sum + order.totalAmount,
      0,
    );
  const totalExpenses = expenses.reduce(
    (sum: number, expense: (typeof expenses)[number]) => sum + expense.nominal,
    0,
  );
  const totalProfit = totalRevenue - totalExpenses;

  // Count orders by status
  const ordersByStatus = {
    pending: orders.filter(
      (order: (typeof orders)[number]) => order.status === "pending",
    ).length,
    processing: orders.filter(
      (order: (typeof orders)[number]) => order.status === "processing",
    ).length,
    finished: orders.filter(
      (order: (typeof orders)[number]) => order.status === "finished",
    ).length,
    canceled: orders.filter(
      (order: (typeof orders)[number]) => order.status === "canceled",
    ).length,
  };

  // Calculate top selling products for the day
  const productSales: Record<
    number,
    { name: string; totalSold: number; totalRevenue: number }
  > = {};

  orders.forEach((order: (typeof orders)[number]) => {
    const items = orderItemsMap[order.id] || [];
    items.forEach((item: (typeof orderItems)[number]) => {
      const productId = item.productId;
      if (!productSales[productId]) {
        productSales[productId] = {
          name: item.product.name,
          totalSold: 0,
          totalRevenue: 0,
        };
      }
      productSales[productId].totalSold += item.qty;
      productSales[productId].totalRevenue += item.subtotal;
    });
  });

  // Convert to array and sort by quantity sold
  const topSellingProducts = Object.entries(productSales)
    .map(([id, data]) => ({
      id: parseInt(id),
      name: data.name,
      totalSold: data.totalSold,
      totalRevenue: data.totalRevenue,
    }))
    .sort(
      (a: { totalSold: number }, b: { totalSold: number }) =>
        b.totalSold - a.totalSold,
    )
    .slice(0, 10); // Top 10 selling products

  // Format orders data for the response
  const formattedOrders = orders.map((order: (typeof orders)[number]) => ({
    id: order.id,
    orderNumber: order.orderNumber,
    status: order.status,
    totalAmount: order.totalAmount,
    createdAt: order.createdAt,
    user: {
      name: order.user.name,
    },
  }));

  // Format expenses data for the response
  const formattedExpenses = expenses.map((expense) => ({
    id: expense.id,
    nominal: expense.nominal,
    category: expense.category,
    description: expense.description,
    date: expense.date,
  }));

  // Return the daily report data
  return {
    date: targetDate,
    totalOrders,
    totalRevenue,
    totalExpenses,
    totalProfit,
    ordersByStatus,
    topSellingProducts,
    orders: formattedOrders,
    expenses: formattedExpenses,
  };
}

/**
 * Gets weekly report data for the specified date range.
 *
 * @param startDate The start date of the week
 * @param endDate The end date of the week
 * @returns Weekly report data
 */
export async function getWeeklyReport(
  startDate: Date,
  endDate: Date,
): Promise<WeeklyReportData> {
  // Fetch orders and related data separately to avoid relationship issues
  const [orders, orderItems, expenses] = await Promise.all([
    // Fetch orders for the selected date range
    prisma.order.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        user: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    }),

    // Fetch order items for those dates by using a subquery with order IDs
    prisma.orderItem.findMany({
      where: {
        order: {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
      },
      include: {
        product: true,
        variant: true,
      },
    }),

    // Fetch expenses for the selected date range
    prisma.expense.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
    }),
  ]);

  // Group orderItems by order ID for efficient processing
  const orderItemsMap: Record<number, typeof orderItems> = {};
  orderItems.forEach((item: (typeof orderItems)[number]) => {
    const orderId = item.orderId; // Using the foreign key directly
    if (!orderItemsMap[orderId]) {
      orderItemsMap[orderId] = [];
    }
    orderItemsMap[orderId].push(item);
  });

  // Calculate report metrics
  const totalOrders = orders.length;
  // Only count revenue from orders with confirmed payments (not pending, failed, or refunded)
  const totalRevenue = orders
    .filter((order) => order.paymentStatus === "confirmed")
    .reduce(
      (sum: number, order: (typeof orders)[number]) => sum + order.totalAmount,
      0,
    );
  const totalExpenses = expenses.reduce(
    (sum: number, expense: (typeof expenses)[number]) => sum + expense.nominal,
    0,
  );
  const totalProfit = totalRevenue - totalExpenses;

  // Count orders by status
  const ordersByStatus = {
    pending: orders.filter(
      (order: (typeof orders)[number]) => order.status === "pending",
    ).length,
    processing: orders.filter(
      (order: (typeof orders)[number]) => order.status === "processing",
    ).length,
    finished: orders.filter(
      (order: (typeof orders)[number]) => order.status === "finished",
    ).length,
    canceled: orders.filter(
      (order: (typeof orders)[number]) => order.status === "canceled",
    ).length,
  };

  // Calculate top selling products for the week
  const productSales: Record<
    number,
    { name: string; totalSold: number; totalRevenue: number }
  > = {};

  orders.forEach((order: (typeof orders)[number]) => {
    const items = orderItemsMap[order.id] || [];
    items.forEach((item: (typeof orderItems)[number]) => {
      const productId = item.productId;
      if (!productSales[productId]) {
        productSales[productId] = {
          name: item.product.name,
          totalSold: 0,
          totalRevenue: 0,
        };
      }
      productSales[productId].totalSold += item.qty;
      productSales[productId].totalRevenue += item.subtotal;
    });
  });

  // Convert to array and sort by quantity sold
  const topSellingProducts = Object.entries(productSales)
    .map(([id, data]) => ({
      id: parseInt(id),
      name: data.name,
      totalSold: data.totalSold,
      totalRevenue: data.totalRevenue,
    }))
    .sort(
      (a: { totalSold: number }, b: { totalSold: number }) =>
        b.totalSold - a.totalSold,
    )
    .slice(0, 10); // Top 10 selling products

  // Format orders data for the response
  const formattedOrders = orders.map((order: (typeof orders)[number]) => ({
    id: order.id,
    orderNumber: order.orderNumber,
    status: order.status,
    totalAmount: order.totalAmount,
    createdAt: order.createdAt,
    user: {
      name: order.user.name,
    },
  }));

  // Format expenses data for the response
  const formattedExpenses = expenses.map((expense) => ({
    id: expense.id,
    nominal: expense.nominal,
    category: expense.category,
    description: expense.description,
    date: expense.date,
  }));

  // Return the weekly report data
  return {
    startDate,
    endDate,
    totalOrders,
    totalRevenue,
    totalExpenses,
    totalProfit,
    ordersByStatus,
    topSellingProducts,
    orders: formattedOrders,
    expenses: formattedExpenses,
  };
}

/**
 * Gets monthly report data for the specified month.
 *
 * @param year The year for the report
 * @param month The month for the report (1-12)
 * @returns Monthly report data
 */
export async function getMonthlyReport(
  year: number,
  month: number,
): Promise<MonthlyReportData> {
  // Calculate date range for the selected month (from 1st day to last day) in local timezone
  const startDate = new Date(year, month - 1, 1, 0, 0, 0, 0); // month is 0-indexed
  const endDate = new Date(year, month, 0, 23, 59, 59, 999); // Last day of the month

  // Fetch orders and related data separately to avoid relationship issues
  const [orders, orderItems, expenses] = await Promise.all([
    // Fetch orders for the selected month
    prisma.order.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        user: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    }),

    // Fetch order items for those dates by using a subquery with order IDs
    prisma.orderItem.findMany({
      where: {
        order: {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
      },
      include: {
        product: true,
        variant: true,
      },
    }),

    // Fetch expenses for the selected month
    prisma.expense.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
    }),
  ]);

  // Group orderItems by order ID for efficient processing
  const orderItemsMap: Record<number, typeof orderItems> = {};
  orderItems.forEach((item: (typeof orderItems)[number]) => {
    const orderId = item.orderId; // Using the foreign key directly
    if (!orderItemsMap[orderId]) {
      orderItemsMap[orderId] = [];
    }
    orderItemsMap[orderId].push(item);
  });

  // Calculate report metrics
  const totalOrders = orders.length;
  // Only count revenue from orders with confirmed payments (not pending, failed, or refunded)
  const totalRevenue = orders
    .filter((order) => order.paymentStatus === "confirmed")
    .reduce(
      (sum: number, order: (typeof orders)[number]) => sum + order.totalAmount,
      0,
    );
  const totalExpenses = expenses.reduce(
    (sum: number, expense: (typeof expenses)[number]) => sum + expense.nominal,
    0,
  );
  const totalProfit = totalRevenue - totalExpenses;

  // Count orders by status
  const ordersByStatus = {
    pending: orders.filter(
      (order: (typeof orders)[number]) => order.status === "pending",
    ).length,
    processing: orders.filter(
      (order: (typeof orders)[number]) => order.status === "processing",
    ).length,
    finished: orders.filter(
      (order: (typeof orders)[number]) => order.status === "finished",
    ).length,
    canceled: orders.filter(
      (order: (typeof orders)[number]) => order.status === "canceled",
    ).length,
  };

  // Calculate top selling products for the month
  const productSales: Record<
    number,
    { name: string; totalSold: number; totalRevenue: number }
  > = {};

  orders.forEach((order: (typeof orders)[number]) => {
    const items = orderItemsMap[order.id] || [];
    items.forEach((item: (typeof orderItems)[number]) => {
      const productId = item.productId;
      if (!productSales[productId]) {
        productSales[productId] = {
          name: item.product.name,
          totalSold: 0,
          totalRevenue: 0,
        };
      }
      productSales[productId].totalSold += item.qty;
      productSales[productId].totalRevenue += item.subtotal;
    });
  });

  // Convert to array and sort by quantity sold
  const topSellingProducts = Object.entries(productSales)
    .map(([id, data]) => ({
      id: parseInt(id),
      name: data.name,
      totalSold: data.totalSold,
      totalRevenue: data.totalRevenue,
    }))
    .sort(
      (a: { totalSold: number }, b: { totalSold: number }) =>
        b.totalSold - a.totalSold,
    )
    .slice(0, 10); // Top 10 selling products

  // Format orders data for the response
  const formattedOrders = orders.map((order: (typeof orders)[number]) => ({
    id: order.id,
    orderNumber: order.orderNumber,
    status: order.status,
    totalAmount: order.totalAmount,
    createdAt: order.createdAt,
    user: {
      name: order.user.name,
    },
  }));

  // Format expenses data for the response
  const formattedExpenses = expenses.map((expense) => ({
    id: expense.id,
    nominal: expense.nominal,
    category: expense.category,
    description: expense.description,
    date: expense.date,
  }));

  // Return the monthly report data
  return {
    startDate,
    endDate,
    totalOrders,
    totalRevenue,
    totalExpenses,
    totalProfit,
    ordersByStatus,
    topSellingProducts,
    orders: formattedOrders,
    expenses: formattedExpenses,
  };
}
