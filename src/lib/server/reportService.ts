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
  ReportResponse 
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

// Helper function to format dates to start of month
function startOfMonth(date: Date): Date {
  const d = new Date(date);
  d.setDate(1);
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
            method: true,
            amount: true,
            status: true,
            transactionRef: true,
            paidAt: true,
            proofs: {
              select: {
                id: true,
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

  const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.nominal, 0);
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
  const weekLabel = `${start.toISOString().split('T')[0]} - ${end.toISOString().split('T')[0]}`;
  
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
            method: true,
            amount: true,
            status: true,
            transactionRef: true,
            paidAt: true,
            proofs: {
              select: {
                id: true,
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

  const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.nominal, 0);
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
export async function getMonthlyReport(year: number, month: number): Promise<MonthlyReport> {
  const start = new Date(year, month, 1);
  const end = endOfMonth(start);
  const monthLabel = `${start.toLocaleString('default', { month: 'long' })} ${year}`;
  
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
            method: true,
            amount: true,
            status: true,
            transactionRef: true,
            paidAt: true,
            proofs: {
              select: {
                id: true,
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

  const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.nominal, 0);
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
            method: true,
            amount: true,
            status: true,
            transactionRef: true,
            paidAt: true,
            proofs: {
              select: {
                id: true,
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

  const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.nominal, 0);
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
export async function getProductPerformanceReport(productId: number, startDate: Date, endDate: Date): Promise<ProductPerformanceReport> {
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
          method: true,
          amount: true,
          status: true,
          transactionRef: true,
          paidAt: true,
          proofs: {
            select: {
              id: true,
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

  orders.forEach(order => {
    order.orderItems.forEach(item => {
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
    productName: product?.name || 'Unknown Product',
    totalSold,
    totalRevenue,
    orders,
  };
}

// Get customer report
export async function getCustomerReport(userId: number, startDate: Date, endDate: Date): Promise<CustomerReport> {
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
          method: true,
          amount: true,
          status: true,
          transactionRef: true,
          paidAt: true,
          proofs: {
            select: {
              id: true,
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
    customerName: user?.name || 'Unknown Customer',
    totalOrders,
    totalSpent,
    orders,
  };
}

// Get all products performance report
export async function getAllProductsPerformanceReport(startDate: Date, endDate: Date): Promise<any> {
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
          method: true,
          amount: true,
          status: true,
          transactionRef: true,
          paidAt: true,
          proofs: {
            select: {
              id: true,
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
  const productStats = new Map<number, { name: string; totalSold: number; totalRevenue: number; orders: any[] }>();
  
  orders.forEach(order => {
    order.orderItems.forEach(item => {
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
          orders: [order]
        });
      }
    });
  });

  // Create a summary of all products
  const allProductsStats = Array.from(productStats.entries()).map(([productId, stats]) => ({
    productId,
    productName: stats.name,
    totalSold: stats.totalSold,
    totalRevenue: stats.totalRevenue,
    orders: stats.orders
  }));

  // Calculate overall totals
  const totalSold = Array.from(productStats.values()).reduce((sum, stat) => sum + stat.totalSold, 0);
  const totalRevenue = Array.from(productStats.values()).reduce((sum, stat) => sum + stat.totalRevenue, 0);

  return {
    totalProducts: allProductsStats.length,
    totalSold,
    totalRevenue,
    products: allProductsStats,
    dateRange: {
      start: startDate,
      end: endDate
    }
  };
}

// Get all customers report
export async function getAllCustomersReport(startDate: Date, endDate: Date): Promise<any> {
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
          method: true,
          amount: true,
          status: true,
          transactionRef: true,
          paidAt: true,
          proofs: {
            select: {
              id: true,
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
  const customerStats = new Map<number, { name: string; totalOrders: number; totalSpent: number; orders: any[] }>();
  
  orders.forEach(order => {
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
          orders: [order]
        });
      }
    }
  });

  // Create a summary of all customers
  const allCustomersStats = Array.from(customerStats.entries()).map(([userId, stats]) => ({
    userId,
    customerName: stats.name,
    totalOrders: stats.totalOrders,
    totalSpent: stats.totalSpent,
    orders: stats.orders
  }));

  // Calculate overall totals
  const totalCustomers = customerStats.size;
  const totalOrdersCount = orders.length;
  const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);

  return {
    totalCustomers,
    totalOrders: totalOrdersCount,
    totalRevenue,
    customers: allCustomersStats,
    dateRange: {
      start: startDate,
      end: endDate
    }
  };
}

// Get revenue report
export async function getRevenueReport(startDate: Date, endDate: Date, paymentStatus?: string): Promise<RevenueReport> {
  const start = startOfDay(startDate);
  const end = endOfDay(endDate);
  
  const whereClause: any = {
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
          method: true,
          amount: true,
          status: true,
          transactionRef: true,
          paidAt: true,
          proofs: {
            select: {
              id: true,
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

  const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
  const period = `${start.toISOString().split('T')[0]} to ${end.toISOString().split('T')[0]}`;

  return {
    period,
    startDate: start,
    endDate: end,
    totalRevenue,
    orders,
  };
}

// Get expense report
export async function getExpenseReport(startDate: Date, endDate: Date, category?: string): Promise<ExpenseReport> {
  const start = startOfDay(startDate);
  const end = endOfDay(endDate);
  
  const whereClause: any = {
    date: {
      gte: start,
      lte: end,
    },
  };

  if (category) {
    whereClause.category = category;
  }

  const expenses = await prisma.expense.findMany({
    where: whereClause,
  });

  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.nominal, 0);
  const period = `${start.toISOString().split('T')[0]} to ${end.toISOString().split('T')[0]}`;

  return {
    period,
    startDate: start,
    endDate: end,
    totalExpenses,
    expenses,
  };
}

// Generic report function that handles all report types
export async function generateReport(filter: ReportFilter): Promise<ReportResponse> {
  const { 
    startDate, 
    endDate, 
    reportType, 
    productId, 
    userId 
  } = filter;

  if (!startDate || !endDate) {
    throw new Error("Start date and end date are required");
  }

  // Remove the userId and productId filters to ensure all reports show all data
  // regardless of whether specific filters were passed
  let reportData: any;
  let summary = { total: 0, revenue: 0, expenses: 0, net: 0 };

  switch (reportType) {
    case 'daily':
      reportData = await getDailyReport(startDate);
      summary = {
        total: reportData.totalOrders,
        revenue: reportData.totalRevenue,
        expenses: reportData.totalExpenses,
        net: reportData.netRevenue
      };
      break;

    case 'weekly':
      reportData = await getWeeklyReport(startDate);
      summary = {
        total: reportData.totalOrders,
        revenue: reportData.totalRevenue,
        expenses: reportData.totalExpenses,
        net: reportData.netRevenue
      };
      break;

    case 'monthly':
      const year = startDate.getFullYear();
      const month = startDate.getMonth();
      reportData = await getMonthlyReport(year, month);
      summary = {
        total: reportData.totalOrders,
        revenue: reportData.totalRevenue,
        expenses: reportData.totalExpenses,
        net: reportData.netRevenue
      };
      break;

    case 'annual':
      const yearValue = startDate.getFullYear();
      reportData = await getAnnualReport(yearValue);
      summary = {
        total: reportData.totalOrders,
        revenue: reportData.totalRevenue,
        expenses: reportData.totalExpenses,
        net: reportData.netRevenue
      };
      break;

    case 'product':
      // Remove filters based on productId - return all products report regardless of input productId
      reportData = await getAllProductsPerformanceReport(startDate, endDate);
      summary = {
        total: reportData.totalSold,
        revenue: reportData.totalRevenue,
        expenses: 0,
        net: reportData.totalRevenue
      };
      break;

    case 'customer':
      // Remove filters based on userId - return all customers report regardless of input userId
      reportData = await getAllCustomersReport(startDate, endDate);
      summary = {
        total: reportData.totalCustomers,
        revenue: reportData.totalRevenue,
        expenses: 0,
        net: reportData.totalRevenue
      };
      break;

    case 'revenue':
      reportData = await getRevenueReport(startDate, endDate);
      summary = {
        total: reportData.orders.length,
        revenue: reportData.totalRevenue,
        expenses: 0,
        net: reportData.totalRevenue
      };
      break;

    case 'expense':
      reportData = await getExpenseReport(startDate, endDate);
      summary = {
        total: reportData.expenses.length,
        revenue: 0,
        expenses: reportData.totalExpenses,
        net: -reportData.totalExpenses
      };
      break;

    default:
      throw new Error(`Unsupported report type: ${reportType}`);
  }

  return {
    reportType,
    data: reportData,
    summary,
    dateRange: {
      start: startDate,
      end: endDate
    }
  };
}