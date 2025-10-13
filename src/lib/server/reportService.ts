// src/lib/server/reportService.ts
import prisma from "$lib/server/prisma";
import type {
  DailyReport,
  WeeklyReport,
  MonthlyReport,
  AnnualReport,
  ProductPerformanceReport,
  CustomerReport,
  RevenueReport,
  ExpenseReport,
  ReportFilter,
  ReportResponse,
  Order,
} from "$lib/types";

// Helper function to format dates to start of day
function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

// Helper function to format dates to end of day
function endOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

// Helper function to format dates to start of week (Monday)
function startOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

// Helper function to format dates to start of year
function startOfYear(date: Date): Date {
  const d = new Date(date);
  d.setMonth(0, 1);
  d.setHours(0, 0, 0, 0);
  return d;
}

// Helper function to format dates to end of week
function endOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() + (6 - day);
  d.setDate(diff);
  d.setHours(23, 59, 59, 999);
  return d;
}

// Helper function to format dates to end of month
function endOfMonth(date: Date): Date {
  const d = new Date(date);
  d.setMonth(d.getMonth() + 1, 0);
  d.setHours(23, 59, 59, 999);
  return d;
}

// Helper function to format dates to end of year
function endOfYear(date: Date): Date {
  const d = new Date(date);
  d.setMonth(11, 31);
  d.setHours(23, 59, 59, 999);
  return d;
}

// Get daily report
export async function getDailyReport(date: Date): Promise<DailyReport> {
  const start = startOfDay(date);
  const end = endOfDay(date);

  const [orders, expenses] = await Promise.all([
    prisma.order.findMany({
      where: {
        createdAt: {
          gte: start,
          lte: end,
        },
        status: { not: "canceled" },
      },
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
    }),
    prisma.expense.findMany({
      where: {
        date: {
          gte: start,
          lte: end,
        },
      },
    }),
  ]);

  const totalRevenue = orders.reduce(
    (sum, order) => sum + order.totalAmount,
    0,
  );
  const totalExpenses = expenses.reduce(
    (sum, expense) => sum + expense.nominal,
    0,
  );
  const netRevenue = totalRevenue - totalExpenses;

  return {
    date,
    orders,
    totalOrders: orders.length,
    totalRevenue,
    totalExpenses,
    netRevenue,
  };
}

// Get weekly report
export async function getWeeklyReport(startDate: Date): Promise<WeeklyReport> {
  const start = startOfWeek(startDate);
  const end = endOfWeek(startDate);
  const weekLabel = `${start.toISOString().split("T")[0]} - ${end.toISOString().split("T")[0]}`;

  const [orders, expenses] = await Promise.all([
    prisma.order.findMany({
      where: {
        createdAt: {
          gte: start,
          lte: end,
        },
        status: { not: "canceled" },
      },
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
    }),
    prisma.expense.findMany({
      where: {
        date: {
          gte: start,
          lte: end,
        },
      },
    }),
  ]);

  const totalRevenue = orders.reduce(
    (sum, order) => sum + order.totalAmount,
    0,
  );
  const totalExpenses = expenses.reduce(
    (sum, expense) => sum + expense.nominal,
    0,
  );
  const netRevenue = totalRevenue - totalExpenses;

  return {
    weekLabel,
    startDate: start,
    endDate: end,
    orders,
    totalOrders: orders.length,
    totalRevenue,
    totalExpenses,
    netRevenue,
  };
}

// Get monthly report
export async function getMonthlyReport(
  year: number,
  month: number,
): Promise<MonthlyReport> {
  const start = new Date(year, month, 1);
  const end = endOfMonth(start);
  const monthLabel = `${start.toLocaleString("default", { month: "long" })} ${year}`;

  const [orders, expenses] = await Promise.all([
    prisma.order.findMany({
      where: {
        createdAt: {
          gte: start,
          lte: end,
        },
        status: { not: "canceled" },
      },
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
    }),
    prisma.expense.findMany({
      where: {
        date: {
          gte: start,
          lte: end,
        },
      },
    }),
  ]);

  const totalRevenue = orders.reduce(
    (sum, order) => sum + order.totalAmount,
    0,
  );
  const totalExpenses = expenses.reduce(
    (sum, expense) => sum + expense.nominal,
    0,
  );
  const netRevenue = totalRevenue - totalExpenses;

  return {
    monthLabel,
    startDate: start,
    endDate: end,
    orders,
    totalOrders: orders.length,
    totalRevenue,
    totalExpenses,
    netRevenue,
  };
}

// Get annual report
export async function getAnnualReport(year: number): Promise<AnnualReport> {
  const start = startOfYear(new Date(year, 0, 1));
  const end = endOfYear(new Date(year, 11, 31));

  const [orders, expenses] = await Promise.all([
    prisma.order.findMany({
      where: {
        createdAt: {
          gte: start,
          lte: end,
        },
        status: { not: "canceled" },
      },
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
    }),
    prisma.expense.findMany({
      where: {
        date: {
          gte: start,
          lte: end,
        },
      },
    }),
  ]);

  const totalRevenue = orders.reduce(
    (sum, order) => sum + order.totalAmount,
    0,
  );
  const totalExpenses = expenses.reduce(
    (sum, expense) => sum + expense.nominal,
    0,
  );
  const netRevenue = totalRevenue - totalExpenses;

  return {
    year,
    orders,
    totalOrders: orders.length,
    totalRevenue,
    totalExpenses,
    netRevenue,
  };
}

// Get product performance report
export async function getProductPerformanceReport(
  productId: number,
  startDate: Date,
  endDate: Date,
): Promise<ProductPerformanceReport> {
  const start = startOfDay(startDate);
  const end = endOfDay(endDate);

  const orders = await prisma.order.findMany({
    where: {
      createdAt: {
        gte: start,
        lte: end,
      },
      status: { not: "canceled" },
      orderItems: {
        some: {
          productId,
        },
      },
    },
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
          variant: { select: { id: true, variantName: true } },
        },
        where: {
          productId,
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

  // Calculate total units sold and revenue for this product
  let totalSold = 0;
  let totalRevenue = 0;

  orders.forEach((order) => {
    order.orderItems.forEach((item) => {
      if (item.productId === productId) {
        totalSold += item.qty;
        totalRevenue += item.subtotal;
      }
    });
  });

  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { name: true },
  });

  return {
    productId,
    productName: product?.name || "Unknown Product",
    totalSold,
    totalRevenue,
    orders,
  };
}

// Get customer report
export async function getCustomerReport(
  userId: number,
  startDate: Date,
  endDate: Date,
): Promise<CustomerReport> {
  const start = startOfDay(startDate);
  const end = endOfDay(endDate);

  const orders = await prisma.order.findMany({
    where: {
      userId,
      createdAt: {
        gte: start,
        lte: end,
      },
      status: { not: "canceled" },
    },
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

  const totalOrders = orders.length;
  const totalSpent = orders.reduce((sum, order) => sum + order.totalAmount, 0);

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true },
  });

  return {
    userId,
    customerName: user?.name || "Unknown Customer",
    totalOrders,
    totalSpent,
    orders,
  };
}

// Get all products performance report
export async function getAllProductsPerformanceReport(
  startDate: Date,
  endDate: Date,
): Promise<ProductPerformanceReport[]> {
  const start = startOfDay(startDate);
  const end = endOfDay(endDate);

  // Get all orders within the date range with their items
  const orders = await prisma.order.findMany({
    where: {
      createdAt: {
        gte: start,
        lte: end,
      },
      status: { not: "canceled" },
    },
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

  // Calculate total statistics for all products
  const productStats = new Map<
    number,
    { name: string; totalSold: number; totalRevenue: number; orders: Order[] }
  >();

  orders.forEach((order) => {
    order.orderItems.forEach((item) => {
      const existing = productStats.get(item.productId);
      if (existing) {
        existing.totalSold += item.qty;
        existing.totalRevenue += item.subtotal;
        existing.orders.push(order);
      } else {
        productStats.set(item.productId, {
          name: item.product.name,
          totalSold: item.qty,
          totalRevenue: item.subtotal,
          orders: [order],
        });
      }
    });
  });

  // Create a summary of all products
  const allProductsStats = Array.from(productStats.entries()).map(
    ([productId, stats]) => ({
      productId,
      productName: stats.name,
      totalSold: stats.totalSold,
      totalRevenue: stats.totalRevenue,
      orders: stats.orders,
    }),
  );

  return allProductsStats;
}

// Get all customers report
export async function getAllCustomersReport(
  startDate: Date,
  endDate: Date,
): Promise<CustomerReport[]> {
  const start = startOfDay(startDate);
  const end = endOfDay(endDate);

  // Get all orders within the date range
  const orders = await prisma.order.findMany({
    where: {
      createdAt: {
        gte: start,
        lte: end,
      },
      status: { not: "canceled" },
    },
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

  // Group orders by customer
  const customerStats = new Map<
    number,
    { name: string; totalOrders: number; totalSpent: number; orders: Order[] }
  >();

  orders.forEach((order) => {
    if (order.userId) {
      const existing = customerStats.get(order.userId);
      if (existing) {
        existing.totalOrders += 1;
        existing.totalSpent += order.totalAmount;
        existing.orders.push(order);
      } else {
        customerStats.set(order.userId, {
          name: order.user?.name || `Customer ${order.userId}`,
          totalOrders: 1,
          totalSpent: order.totalAmount,
          orders: [order],
        });
      }
    }
  });

  // Create a summary of all customers
  const allCustomersStats = Array.from(customerStats.entries()).map(
    ([userId, stats]) => ({
      userId,
      customerName: stats.name,
      totalOrders: stats.totalOrders,
      totalSpent: stats.totalSpent,
      orders: stats.orders,
    }),
  );

  return allCustomersStats;
}

// Get revenue report
export async function getRevenueReport(
  startDate: Date,
  endDate: Date,
  paymentStatus?: "pending" | "confirmed" | "failed" | "refunded",
): Promise<RevenueReport> {
  const start = startOfDay(startDate);
  const end = endOfDay(endDate);

  const whereClause: {
    createdAt: { gte: Date; lte: Date };
    status: { not: "pending" | "processing" | "finished" | "canceled" };
    paymentStatus?: "pending" | "confirmed" | "failed" | "refunded";
  } = {
    createdAt: {
      gte: start,
      lte: end,
    },
    status: { not: "canceled" },
  };

  if (paymentStatus) {
    whereClause.paymentStatus = paymentStatus;
  }

  const orders = await prisma.order.findMany({
    where: whereClause,
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

  const totalRevenue = orders.reduce(
    (sum, order) => sum + order.totalAmount,
    0,
  );
  const period = `${start.toISOString().split("T")[0]} to ${end.toISOString().split("T")[0]}`;

  return {
    period,
    startDate: start,
    endDate: end,
    totalRevenue,
    orders,
  };
}

// Get expense report
export async function getExpenseReport(
  startDate: Date,
  endDate: Date,
  category?: string,
): Promise<ExpenseReport> {
  const start = startOfDay(startDate);
  const end = endOfDay(endDate);

  // Build the where clause with proper Prisma types
  const whereClause: {
    date: { gte: Date; lte: Date };
    category?: "operasional" | "marketing" | "gaji" | "lainnya";
  } = {
    date: {
      gte: start,
      lte: end,
    },
  };

  if (category) {
    // Validate that category is one of the allowed ExpenseCategory values
    const validCategories = ["operasional", "marketing", "gaji", "lainnya"];
    if (validCategories.includes(category)) {
      whereClause.category = category as
        | "operasional"
        | "marketing"
        | "gaji"
        | "lainnya";
    }
  }

  const expenses = await prisma.expense.findMany({
    where: whereClause,
  });

  const totalExpenses = expenses.reduce(
    (sum, expense) => sum + expense.nominal,
    0,
  );
  const period = `${start.toISOString().split("T")[0]} to ${end.toISOString().split("T")[0]}`;

  return {
    period,
    startDate: start,
    endDate: end,
    totalExpenses,
    expenses,
  };
}

// Generic report function that handles all report types
export async function generateReport(
  filter: ReportFilter,
): Promise<ReportResponse> {
  const { startDate, endDate, reportType, productId, userId } = filter;

  if (!startDate || !endDate) {
    throw new Error("Start date and end date are required");
  }

  // Convert to Date objects if they are strings
  const startDateObj =
    typeof startDate === "string" ? new Date(startDate) : startDate;
  const endDateObj = typeof endDate === "string" ? new Date(endDate) : endDate;

  let reportData: any;
  let summary = { total: 0, revenue: 0, expenses: 0, net: 0 };

  switch (reportType) {
    case "daily": {
      const dailyReport = await getDailyReport(startDateObj);
      reportData = {
        orders: dailyReport.orders.map(order => ({
          id: order.id,
          orderNumber: order.orderNumber,
          status: order.status,
          paymentStatus: order.paymentStatus,
          totalAmount: order.totalAmount,
          createdAt: order.createdAt,
          user: {
            name: order.user.name,
            phone: order.user.phone,
          }
        })),
        totalOrders: dailyReport.totalOrders,
        totalRevenue: dailyReport.totalRevenue,
        totalExpenses: dailyReport.totalExpenses,
        netRevenue: dailyReport.netRevenue
      };
      summary = {
        total: dailyReport.totalOrders,
        revenue: dailyReport.totalRevenue,
        expenses: dailyReport.totalExpenses,
        net: dailyReport.netRevenue,
      };
      break;
    }

    case "weekly": {
      const weeklyReport = await getWeeklyReport(startDateObj);
      // Get daily breakdown for the week
      const dailyBreakdown = [];
      const currentDate = new Date(weeklyReport.startDate);
      while (currentDate <= weeklyReport.endDate) {
        const dailyData = await getDailyReport(currentDate);
        dailyBreakdown.push({
          date: currentDate,
          totalOrders: dailyData.totalOrders,
          totalRevenue: dailyData.totalRevenue
        });
        currentDate.setDate(currentDate.getDate() + 1);
      }
      
      reportData = {
        weeklyStats: {
          weekLabel: weeklyReport.weekLabel,
          totalOrders: weeklyReport.totalOrders,
          totalRevenue: weeklyReport.totalRevenue,
          totalExpenses: weeklyReport.totalExpenses,
          netRevenue: weeklyReport.netRevenue
        },
        dailyBreakdown
      };
      summary = {
        total: weeklyReport.totalOrders,
        revenue: weeklyReport.totalRevenue,
        expenses: weeklyReport.totalExpenses,
        net: weeklyReport.netRevenue,
      };
      break;
    }

    case "monthly": {
      const year = startDateObj.getFullYear();
      const month = startDateObj.getMonth();
      const monthlyReport = await getMonthlyReport(year, month);
      // Get weekly breakdown for the month
      const weeklyBreakdown = [];
      const startDateForMonth = new Date(year, month, 1);
      let currentDate = new Date(startDateForMonth);
      
      // Calculate weekly breakdown by going through each week in the month
      while (currentDate <= monthlyReport.endDate) {
        const weekStart = new Date(currentDate);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        if (weekEnd > monthlyReport.endDate) {
          weekEnd.setTime(monthlyReport.endDate.getTime());
        }
        
        // Get orders for this week
        const ordersInWeek = await prisma.order.findMany({
          where: {
            createdAt: {
              gte: weekStart,
              lte: weekEnd,
            },
            status: { not: "canceled" },
          },
          select: {
            totalAmount: true,
            createdAt: true,
          }
        });
        
        const totalRevenue = ordersInWeek.reduce((sum, order) => sum + order.totalAmount, 0);
        const totalOrders = ordersInWeek.length;
        
        weeklyBreakdown.push({
          weekLabel: `Week of ${weekStart.toISOString().split('T')[0]}`,
          totalOrders,
          totalRevenue
        });
        
        currentDate.setDate(currentDate.getDate() + 7);
      }
      
      reportData = {
        monthlyStats: {
          monthLabel: monthlyReport.monthLabel,
          totalOrders: monthlyReport.totalOrders,
          totalRevenue: monthlyReport.totalRevenue,
          totalExpenses: monthlyReport.totalExpenses,
          netRevenue: monthlyReport.netRevenue
        },
        weeklyBreakdown
      };
      summary = {
        total: monthlyReport.totalOrders,
        revenue: monthlyReport.totalRevenue,
        expenses: monthlyReport.totalExpenses,
        net: monthlyReport.netRevenue,
      };
      break;
    }

    case "annual": {
      const yearValue = startDateObj.getFullYear();
      const annualReport = await getAnnualReport(yearValue);
      // Get monthly breakdown for the year
      const monthlyBreakdown = [];
      for (let month = 0; month < 12; month++) {
        const monthlyReport = await getMonthlyReport(yearValue, month);
        monthlyBreakdown.push({
          monthLabel: `${monthlyReport.monthLabel}`,
          totalOrders: monthlyReport.totalOrders,
          totalRevenue: monthlyReport.totalRevenue
        });
      }
      
      reportData = {
        annualStats: {
          year: annualReport.year,
          totalOrders: annualReport.totalOrders,
          totalRevenue: annualReport.totalRevenue,
          totalExpenses: annualReport.totalExpenses,
          netRevenue: annualReport.netRevenue
        },
        monthlyBreakdown
      };
      summary = {
        total: annualReport.totalOrders,
        revenue: annualReport.totalRevenue,
        expenses: annualReport.totalExpenses,
        net: annualReport.netRevenue,
      };
      break;
    }

    case "product": {
      if (productId) {
        // Individual product report
        const productReport = await getProductPerformanceReport(
          productId,
          startDateObj,
          endDateObj
        );
        reportData = {
          products: [{
            id: productReport.productId,
            name: productReport.productName,
            totalSold: productReport.totalSold,
            totalRevenue: productReport.totalRevenue
          }],
          totalProducts: 1,
          totalSold: productReport.totalSold,
          totalRevenue: productReport.totalRevenue
        };
        summary = {
          total: productReport.totalSold,
          revenue: productReport.totalRevenue,
          expenses: 0,
          net: productReport.totalRevenue,
        };
      } else {
        // All products report
        const productReport = await getAllProductsPerformanceReport(
          startDateObj,
          endDateObj
        );
        reportData = {
          products: productReport.map(p => ({
            id: p.productId,
            name: p.productName,
            totalSold: p.totalSold,
            totalRevenue: p.totalRevenue
          })),
          totalProducts: productReport.length,
          totalSold: productReport.reduce((sum, p) => sum + p.totalSold, 0),
          totalRevenue: productReport.reduce((sum, p) => sum + p.totalRevenue, 0)
        };
        const totalSold = reportData.totalSold;
        const totalRevenue = reportData.totalRevenue;
        summary = {
          total: totalSold,
          revenue: totalRevenue,
          expenses: 0,
          net: totalRevenue,
        };
      }
      break;
    }

    case "customer": {
      if (userId) {
        // Individual customer report
        const customerReport = await getCustomerReport(
          userId,
          startDateObj,
          endDateObj
        );
        reportData = {
          customers: [{
            id: customerReport.userId,
            name: customerReport.customerName,
            totalOrders: customerReport.totalOrders,
            totalSpent: customerReport.totalSpent
          }],
          totalCustomers: 1,
          totalOrders: customerReport.totalOrders,
          totalRevenue: customerReport.totalSpent
        };
        summary = {
          total: customerReport.totalOrders,
          revenue: customerReport.totalSpent,
          expenses: 0,
          net: customerReport.totalSpent,
        };
      } else {
        // All customers report
        const customerReport = await getAllCustomersReport(
          startDateObj,
          endDateObj
        );
        reportData = {
          customers: customerReport.map(c => ({
            id: c.userId,
            name: c.customerName,
            totalOrders: c.totalOrders,
            totalSpent: c.totalSpent
          })),
          totalCustomers: customerReport.length,
          totalOrders: customerReport.reduce((sum, c) => sum + c.totalOrders, 0),
          totalRevenue: customerReport.reduce((sum, c) => sum + c.totalSpent, 0)
        };
        const totalOrders = reportData.totalOrders;
        const totalRevenue = reportData.totalRevenue;
        summary = {
          total: totalOrders,
          revenue: totalRevenue,
          expenses: 0,
          net: totalRevenue,
        };
      }
      break;
    }

    case "revenue": {
      const revenueReport = await getRevenueReport(startDateObj, endDateObj);
      reportData = {
        totalRevenue: revenueReport.totalRevenue,
        orders: revenueReport.orders.map(order => ({
          id: order.id,
          orderNumber: order.orderNumber,
          totalAmount: order.totalAmount,
          createdAt: order.createdAt,
          paymentStatus: order.paymentStatus
        }))
      };
      summary = {
        total: revenueReport.orders.length,
        revenue: revenueReport.totalRevenue,
        expenses: 0,
        net: revenueReport.totalRevenue,
      };
      break;
    }

    case "expense": {
      const expenseReport = await getExpenseReport(startDateObj, endDateObj);
      reportData = {
        totalExpenses: expenseReport.totalExpenses,
        expenses: expenseReport.expenses.map(expense => ({
          id: expense.id,
          nominal: expense.nominal,
          category: expense.category,
          description: expense.description,
          date: expense.date
        }))
      };
      summary = {
        total: expenseReport.expenses.length,
        revenue: 0,
        expenses: expenseReport.totalExpenses,
        net: -expenseReport.totalExpenses,
      };
      break;
    }

    default:
      throw new Error(`Unsupported report type: ${reportType as string}`);
  }

  return {
    reportType,
    data: reportData,
    summary,
    dateRange: {
      start: startDateObj,
      end: endDateObj,
    },
  };
}
