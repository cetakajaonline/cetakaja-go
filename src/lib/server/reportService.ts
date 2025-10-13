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
  const { startDate, endDate, reportType } = filter;

  if (!startDate || !endDate) {
    throw new Error("Start date and end date are required");
  }

  // Convert to Date objects if they are strings
  const startDateObj =
    typeof startDate === "string" ? new Date(startDate) : startDate;
  const endDateObj = typeof endDate === "string" ? new Date(endDate) : endDate;

  // Remove the userId and productId filters to ensure all reports show all data
  // regardless of whether specific filters were passed
  let reportData:
    | DailyReport
    | WeeklyReport
    | MonthlyReport
    | AnnualReport
    | ProductPerformanceReport[]
    | CustomerReport[]
    | RevenueReport[]
    | ExpenseReport[];
  let summary = { total: 0, revenue: 0, expenses: 0, net: 0 };

  switch (reportType) {
    case "daily": {
      const dailyReport = await getDailyReport(startDateObj);
      reportData = dailyReport;
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
      reportData = weeklyReport;
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
      reportData = monthlyReport;
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
      reportData = annualReport;
      summary = {
        total: annualReport.totalOrders,
        revenue: annualReport.totalRevenue,
        expenses: annualReport.totalExpenses,
        net: annualReport.netRevenue,
      };
      break;
    }

    case "product": {
      // Remove filters based on productId - return all products report regardless of input productId
      const productReport = await getAllProductsPerformanceReport(
        startDateObj,
        endDateObj,
      );
      reportData = productReport;
      // reportData is an array of ProductPerformanceReport
      const totalProductSold = productReport.reduce(
        (sum, item) => sum + item.totalSold,
        0,
      );
      const totalProductRevenue = productReport.reduce(
        (sum, item) => sum + item.totalRevenue,
        0,
      );
      summary = {
        total: totalProductSold,
        revenue: totalProductRevenue,
        expenses: 0,
        net: totalProductRevenue,
      };
      break;
    }

    case "customer": {
      // Remove filters based on userId - return all customers report regardless of input userId
      const customerReport = await getAllCustomersReport(
        startDateObj,
        endDateObj,
      );
      reportData = customerReport;
      // reportData is an array of CustomerReport
      const totalCustomersCount = customerReport.length;
      const totalCustomerRevenue = customerReport.reduce(
        (sum, item) => sum + item.totalSpent,
        0,
      );
      summary = {
        total: totalCustomersCount,
        revenue: totalCustomerRevenue,
        expenses: 0,
        net: totalCustomerRevenue,
      };
      break;
    }

    case "revenue": {
      const revenueReportResult = await getRevenueReport(
        startDateObj,
        endDateObj,
      );
      // getRevenueReport now returns RevenueReport[] based on reportClient.ts fixes
      const revenueReport: RevenueReport[] = Array.isArray(revenueReportResult)
        ? revenueReportResult
        : [revenueReportResult];
      reportData = revenueReport;
      const totalRevenue = revenueReport.reduce(
        (sum, item) => sum + item.totalRevenue,
        0,
      );
      const totalOrders = revenueReport.reduce(
        (sum, item) => sum + item.orders.length,
        0,
      );
      summary = {
        total: totalOrders,
        revenue: totalRevenue,
        expenses: 0,
        net: totalRevenue,
      };
      break;
    }

    case "expense": {
      const expenseReportResult = await getExpenseReport(
        startDateObj,
        endDateObj,
      );
      // getExpenseReport now returns ExpenseReport[] based on reportClient.ts fixes
      const expenseReport: ExpenseReport[] = Array.isArray(expenseReportResult)
        ? expenseReportResult
        : [expenseReportResult];
      reportData = expenseReport;
      const totalExpenses = expenseReport.reduce(
        (sum, item) => sum + item.totalExpenses,
        0,
      );
      const totalExpenseItems = expenseReport.reduce(
        (sum, item) => sum + item.expenses.length,
        0,
      );
      summary = {
        total: totalExpenseItems,
        revenue: 0,
        expenses: totalExpenses,
        net: -totalExpenses,
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
