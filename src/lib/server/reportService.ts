import prisma from "$lib/server/prisma";
import type {
  DailyReportData,
  WeeklyReportData,
  MonthlyReportData,
  AnnualReportData,
  CustomerReportData,
  ProductReportData,
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

/**
 * Gets annual report data for the specified year.
 *
 * @param year The year for the report
 * @returns Annual report data
 */
export async function getAnnualReport(year: number): Promise<AnnualReportData> {
  // Calculate date range for the selected year (from Jan 1 to Dec 31) in local timezone
  const startDate = new Date(year, 0, 1, 0, 0, 0, 0); // January 1st
  const endDate = new Date(year, 11, 31, 23, 59, 59, 999); // December 31st

  // Fetch orders and related data separately to avoid relationship issues
  const [orders, orderItems, expenses] = await Promise.all([
    // Fetch orders for the selected year
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

    // Fetch expenses for the selected year
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

  // Calculate top selling products for the year
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

  // Return the annual report data
  return {
    year,
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
 * Gets customer report data for the specified date range.
 *
 * @param startDate The start date for the report
 * @param endDate The end date for the report
 * @returns Customer report data
 */
export async function getCustomerReport(
  startDate: Date,
  endDate: Date,
): Promise<CustomerReportData> {
  // Fetch customers and related data separately to avoid relationship issues
  const [customers, orders, orderItems] = await Promise.all([
    // Fetch customers who have orders in the selected date range
    prisma.user.findMany({
      where: {
        orders: {
          some: {
            createdAt: {
              gte: startDate,
              lte: endDate,
            },
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    }),

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
            phone: true,
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
  const totalCustomers = customers.length;
  const totalOrders = orders.length;
  // Only count revenue from orders with confirmed payments (not pending, failed, or refunded)
  const totalRevenue = orders
    .filter((order) => order.paymentStatus === "confirmed")
    .reduce(
      (sum: number, order: (typeof orders)[number]) => sum + order.totalAmount,
      0,
    );
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  // Calculate customer metrics
  const customerMetrics: Record<
    number,
    {
      totalOrders: number;
      totalSpent: number;
      orderValues: number[];
    }
  > = {};

  orders.forEach((order: (typeof orders)[number]) => {
    const customerId = order.userId;
    if (!customerMetrics[customerId]) {
      customerMetrics[customerId] = {
        totalOrders: 0,
        totalSpent: 0,
        orderValues: [],
      };
    }

    customerMetrics[customerId].totalOrders += 1;
    customerMetrics[customerId].totalSpent += order.totalAmount;
    customerMetrics[customerId].orderValues.push(order.totalAmount);
  });

  // Calculate top customers
  const topCustomers = customers
    .map((customer) => {
      const metrics = customerMetrics[customer.id] || {
        totalOrders: 0,
        totalSpent: 0,
        orderValues: [],
      };
      const averageOrderValue =
        metrics.orderValues.length > 0
          ? metrics.orderValues.reduce((sum, val) => sum + val, 0) /
            metrics.orderValues.length
          : 0;

      return {
        id: customer.id,
        name: customer.name,
        phone: customer.phone,
        totalOrders: metrics.totalOrders,
        totalSpent: metrics.totalSpent,
        averageOrderValue: averageOrderValue,
      };
    })
    .sort((a, b) => b.totalSpent - a.totalSpent)
    .slice(0, 10); // Top 10 customers

  // Format customer orders data for the response
  const customerOrders = orders.map((order: (typeof orders)[number]) => ({
    id: order.id,
    customerId: order.userId,
    customerName: order.user.name,
    customerPhone: order.user.phone,
    orderNumber: order.orderNumber,
    totalAmount: order.totalAmount,
    status: order.status,
    createdAt: order.createdAt,
  }));

  // Return the customer report data
  return {
    startDate,
    endDate,
    totalCustomers,
    totalOrders,
    totalRevenue,
    averageOrderValue,
    topCustomers,
    customerOrders,
  };
}

/**
 * Gets product report data for the specified date range.
 *
 * @param startDate The start date for the report
 * @param endDate The end date for the report
 * @returns Product report data
 */
export async function getProductReport(
  startDate: Date,
  endDate: Date,
): Promise<ProductReportData> {
  // Fetch products and related data separately to avoid relationship issues
  const [products, orderItems] = await Promise.all([
    // Fetch all products
    prisma.product.findMany({
      include: {
        category: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    }),

    // Fetch order items for the selected date range
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
        product: {
          include: {
            category: {
              select: {
                name: true,
              },
            },
          },
        },
        variant: true,
        order: {
          include: {
            user: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    }),

    // Fetch orders for the selected date range (needed for order details)
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
  ]);

  // Calculate report metrics
  const totalProducts = products.length;

  // Calculate product sales data
  const productSalesMap: Record<
    number,
    {
      totalSold: number;
      totalRevenue: number;
      orders: Array<{
        orderId: number;
        orderNumber: string;
        customerName: string;
        quantity: number;
        totalPrice: number;
        orderDate: Date;
      }>;
    }
  > = {};

  // Process order items to calculate product sales
  orderItems.forEach((item: (typeof orderItems)[number]) => {
    const productId = item.productId;
    if (!productSalesMap[productId]) {
      productSalesMap[productId] = {
        totalSold: 0,
        totalRevenue: 0,
        orders: [],
      };
    }

    productSalesMap[productId].totalSold += item.qty;
    productSalesMap[productId].totalRevenue += item.subtotal;

    // Add order details
    productSalesMap[productId].orders.push({
      orderId: item.orderId,
      orderNumber: item.order.orderNumber,
      customerName: item.order.user.name,
      quantity: item.qty,
      totalPrice: item.subtotal,
      orderDate: item.order.createdAt,
    });
  });

  // Calculate top selling products
  const topSellingProducts = Object.entries(productSalesMap)
    .map(([productId, data]) => {
      const product = products.find((p) => p.id === parseInt(productId));
      if (!product) return null;

      const averagePrice =
        data.totalSold > 0 ? data.totalRevenue / data.totalSold : 0;

      return {
        id: product.id,
        name: product.name,
        baseCode: product.baseCode,
        category: product.category.name,
        totalSold: data.totalSold,
        totalRevenue: data.totalRevenue,
        averagePrice: averagePrice,
      };
    })
    .filter(Boolean)
    .sort((a: {totalSold: number}, b: {totalSold: number}) => b.totalSold - a.totalSold)
    .slice(0, 10) as typeof topSellingProducts; // Top 10 selling products

  // Calculate total sold
  const totalSold = Object.values(productSalesMap).reduce(
    (sum, product) => sum + product.totalSold,
    0,
  );

  // Calculate total revenue
  const totalRevenue = Object.values(productSalesMap).reduce(
    (sum, product) => sum + product.totalRevenue,
    0,
  );

  // Format product sales data for the response
  const productSales = Object.entries(productSalesMap)
    .map(([productId, data]) => {
      const product = products.find((p) => p.id === parseInt(productId));
      if (!product) return null;

      return {
        id: product.id,
        productId: product.id,
        productName: product.name,
        baseCode: product.baseCode,
        category: product.category.name,
        totalSold: data.totalSold,
        totalRevenue: data.totalRevenue,
        orders: data.orders,
      };
    })
    .filter(Boolean) as typeof productSales;

  // Return the product report data
  return {
    startDate,
    endDate,
    totalProducts,
    totalSold,
    totalRevenue,
    topSellingProducts,
    productSales,
  };
}
