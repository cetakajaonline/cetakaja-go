// Utility functions for Excel export
import type {
  DailyReportData,
  WeeklyReportData,
  MonthlyReportData,
  AnnualReportData,
  CustomerReportData,
  ProductReportData,
  RevenueReportData,
  ExpenseReportData,
  MarginReportData,
} from "$lib/types";

import { formatCurrency, capitalizeFirstLetter } from "./formatters";

/**
 * Exports daily report data to Excel format
 * @param reportData The daily report data to export
 * @param reportDate The date of the report
 */
export async function exportDailyReportToExcel(
  reportData: DailyReportData,
  reportDate: Date,
): Promise<void> {
  // Dynamically import xlsx (SheetJS) to avoid SSR issues
  const XLSX = await import("xlsx");

  // Create a new workbook
  const wb = XLSX.utils.book_new();

  // 1. Summary Sheet
  const summaryHeaders: (string | number)[] = [
    "Laporan Harian",
    new Date(reportData.date).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }),
  ];

  const emptyRow: (string | number)[] = [""];

  const summaryRows: (string | number)[][] = [
    ["Total Orders", reportData.totalOrders],
    ["Total Pendapatan", formatCurrency(reportData.totalRevenue)],
    ["Total Pengeluaran", formatCurrency(reportData.totalExpenses)],
    ["Keuntungan", formatCurrency(reportData.totalProfit)],
    emptyRow,
    ["Ringkasan Status Order", ""],
    ["Pending", reportData.ordersByStatus.pending],
    ["Processing", reportData.ordersByStatus.processing],
    ["Selesai", reportData.ordersByStatus.finished],
    ["Dibatalkan", reportData.ordersByStatus.canceled],
  ];

  const summaryData: (string | number)[][] = [
    summaryHeaders,
    emptyRow,
    ...summaryRows,
  ];

  const summaryWs = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(wb, summaryWs, "Ringkasan");

  // 2. Top Selling Products Sheet
  if (reportData.topSellingProducts.length > 0) {
    const topProductsHeaders: (string | number)[] = [
      "Nama Produk",
      "Jumlah Terjual",
      "Total Pendapatan",
    ];

    // Helper function to ensure type safety
    const createTopProductRow = (
      product: (typeof reportData.topSellingProducts)[number],
    ): (string | number)[] => {
      const nameStr: string = product.name;
      const totalSoldNum: number = product.totalSold;
      const totalRevenueNum: number = product.totalRevenue;

      return [nameStr, totalSoldNum, totalRevenueNum];
    };

    const topProductsRows: (string | number)[][] =
      reportData.topSellingProducts.map(createTopProductRow);
    const topProductsData: (string | number)[][] = [
      topProductsHeaders,
      ...topProductsRows,
    ];

    const topProductsWs = XLSX.utils.aoa_to_sheet(topProductsData);

    // Set column width for product name column (index 0)
    if (!topProductsWs["!cols"]) topProductsWs["!cols"] = [];
    topProductsWs["!cols"][0] = { wch: 25 }; // Set product name column width to 25 characters

    XLSX.utils.book_append_sheet(wb, topProductsWs, "Produk Terlaris");
  }

  // 3. Orders Sheet
  if (reportData.orders.length > 0) {
    const ordersHeaders: (string | number)[] = [
      "Waktu",
      "No. Order",
      "Pelanggan",
      "Status",
      "Total",
    ];

    // Helper function to ensure type safety
    const createOrderRow = (
      order: (typeof reportData.orders)[number],
    ): (string | number)[] => {
      const dateStr: string = order.createdAt
        ? new Date(order.createdAt).toLocaleDateString("id-ID")
        : "";
      const orderNumberStr: string = order.orderNumber;
      const userNameStr: string = order.user.name;
      const statusStr: string = order.status;
      const totalAmountNum: number = order.totalAmount;

      return [dateStr, orderNumberStr, userNameStr, statusStr, totalAmountNum];
    };

    const ordersRows: (string | number)[][] =
      reportData.orders.map(createOrderRow);
    const ordersData: (string | number)[][] = [ordersHeaders, ...ordersRows];

    const ordersWs = XLSX.utils.aoa_to_sheet(ordersData);
    XLSX.utils.book_append_sheet(wb, ordersWs, "Rincian Pendapatan");
  }

  // 4. Expenses Sheet
  if (reportData.expenses.length > 0) {
    const expensesHeaders: (string | number)[] = [
      "Waktu",
      "Kategori",
      "Deskripsi",
      "Nominal",
    ];

    // Helper function to ensure type safety
    const createExpenseRow = (
      expense: (typeof reportData.expenses)[number],
    ): (string | number)[] => {
      const dateStr: string = expense.date
        ? new Date(expense.date).toLocaleDateString("id-ID")
        : "";
      const categoryStr: string = capitalizeFirstLetter(expense.category);
      const descriptionStr: string = expense.description || "-";
      const nominalNum: number = expense.nominal;

      return [dateStr, categoryStr, descriptionStr, nominalNum];
    };

    const expensesRows: (string | number)[][] =
      reportData.expenses.map(createExpenseRow);
    const expensesData: (string | number)[][] = [
      expensesHeaders,
      ...expensesRows,
    ];

    const expensesWs = XLSX.utils.aoa_to_sheet(expensesData);

    // Set column width and text wrapping for description column (index 2)
    if (!expensesWs["!cols"]) expensesWs["!cols"] = [];
    expensesWs["!cols"][2] = { wch: 30 }; // Set description column width to 30 characters

    XLSX.utils.book_append_sheet(wb, expensesWs, "Rincian Pengeluaran");
  }

  // Save the workbook
  const fileName = `laporan-harian-${reportDate.toISOString().split("T")[0]}.xlsx`;
  XLSX.writeFile(wb, fileName);
}

/**
 * Exports weekly report data to Excel format
 * @param reportData The weekly report data to export
 * @param startDate The start date of the week
 * @param endDate The end date of the week
 */
export async function exportWeeklyReportToExcel(
  reportData: WeeklyReportData,
  startDate: Date,
  endDate: Date,
): Promise<void> {
  // Dynamically import xlsx (SheetJS) to avoid SSR issues
  const XLSX = await import("xlsx");

  // Create a new workbook
  const wb = XLSX.utils.book_new();

  // 1. Summary Sheet
  const summaryHeaders: (string | number)[] = [
    "Laporan Mingguan",
    `${new Date(reportData.startDate).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })} s.d. ${new Date(reportData.endDate).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })}`,
  ];

  const emptyRow: (string | number)[] = [""];

  const summaryRows: (string | number)[][] = [
    ["Total Orders", reportData.totalOrders],
    ["Total Pendapatan", formatCurrency(reportData.totalRevenue)],
    ["Total Pengeluaran", formatCurrency(reportData.totalExpenses)],
    ["Keuntungan", formatCurrency(reportData.totalProfit)],
    emptyRow,
    ["Ringkasan Status Order Minggu Ini", ""],
    ["Pending", reportData.ordersByStatus.pending],
    ["Processing", reportData.ordersByStatus.processing],
    ["Selesai", reportData.ordersByStatus.finished],
    ["Dibatalkan", reportData.ordersByStatus.canceled],
  ];

  const summaryData: (string | number)[][] = [
    summaryHeaders,
    emptyRow,
    ...summaryRows,
  ];

  const summaryWs = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(wb, summaryWs, "Ringkasan Mingguan");

  // 2. Top Selling Products Sheet
  if (reportData.topSellingProducts.length > 0) {
    const topProductsHeaders: (string | number)[] = [
      "Nama Produk",
      "Jumlah Terjual",
      "Total Pendapatan",
    ];

    // Helper function to ensure type safety
    const createTopProductRow = (
      product: (typeof reportData.topSellingProducts)[number],
    ): (string | number)[] => {
      const nameStr: string = product.name;
      const totalSoldNum: number = product.totalSold;
      const totalRevenueNum: number = product.totalRevenue;

      return [nameStr, totalSoldNum, totalRevenueNum];
    };

    const topProductsRows: (string | number)[][] =
      reportData.topSellingProducts.map(createTopProductRow);
    const topProductsData: (string | number)[][] = [
      topProductsHeaders,
      ...topProductsRows,
    ];

    const topProductsWs = XLSX.utils.aoa_to_sheet(topProductsData);

    // Set column width for product name column (index 0)
    if (!topProductsWs["!cols"]) topProductsWs["!cols"] = [];
    topProductsWs["!cols"][0] = { wch: 25 }; // Set product name column width to 25 characters

    XLSX.utils.book_append_sheet(
      wb,
      topProductsWs,
      "Produk Terlaris Minggu Ini",
    );
  }

  // 3. Orders Sheet
  if (reportData.orders.length > 0) {
    const ordersHeaders: (string | number)[] = [
      "Waktu",
      "No. Order",
      "Pelanggan",
      "Status",
      "Total",
    ];

    // Helper function to ensure type safety
    const createOrderRow = (
      order: (typeof reportData.orders)[number],
    ): (string | number)[] => {
      const dateStr: string = order.createdAt
        ? new Date(order.createdAt).toLocaleDateString("id-ID")
        : "";
      const orderNumberStr: string = order.orderNumber;
      const userNameStr: string = order.user.name;
      const statusStr: string = order.status;
      const totalAmountNum: number = order.totalAmount;

      return [dateStr, orderNumberStr, userNameStr, statusStr, totalAmountNum];
    };

    const ordersRows: (string | number)[][] =
      reportData.orders.map(createOrderRow);
    const ordersData: (string | number)[][] = [ordersHeaders, ...ordersRows];

    const ordersWs = XLSX.utils.aoa_to_sheet(ordersData);
    XLSX.utils.book_append_sheet(wb, ordersWs, "Rincian Pendapatan Minggu Ini");
  }

  // 4. Expenses Sheet
  if (reportData.expenses.length > 0) {
    const expensesHeaders: (string | number)[] = [
      "Waktu",
      "Kategori",
      "Deskripsi",
      "Nominal",
    ];

    // Helper function to ensure type safety
    const createExpenseRow = (
      expense: (typeof reportData.expenses)[number],
    ): (string | number)[] => {
      const dateStr: string = expense.date
        ? new Date(expense.date).toLocaleDateString("id-ID")
        : "";
      const categoryStr: string = capitalizeFirstLetter(expense.category);
      const descriptionStr: string = expense.description || "-";
      const nominalNum: number = expense.nominal;

      return [dateStr, categoryStr, descriptionStr, nominalNum];
    };

    const expensesRows: (string | number)[][] =
      reportData.expenses.map(createExpenseRow);
    const expensesData: (string | number)[][] = [
      expensesHeaders,
      ...expensesRows,
    ];

    const expensesWs = XLSX.utils.aoa_to_sheet(expensesData);

    // Set column width and text wrapping for description column (index 2)
    if (!expensesWs["!cols"]) expensesWs["!cols"] = [];
    expensesWs["!cols"][2] = { wch: 30 }; // Set description column width to 30 characters

    XLSX.utils.book_append_sheet(
      wb,
      expensesWs,
      "Rincian Pengeluaran Minggu Ini",
    );
  }

  // Save the workbook
  const fileName = `laporan-mingguan-${startDate.toISOString().split("T")[0]}-${endDate.toISOString().split("T")[0]}.xlsx`;
  XLSX.writeFile(wb, fileName);
}

/**
 * Exports monthly report data to Excel format
 * @param reportData The monthly report data to export
 * @param startDate The start date of the month
 * @param endDate The end date of the month
 */
export async function exportMonthlyReportToExcel(
  reportData: MonthlyReportData,
  startDate: Date,
  endDate: Date,
): Promise<void> {
  // Dynamically import xlsx (SheetJS) to avoid SSR issues
  const XLSX = await import("xlsx");

  // Create a new workbook
  const wb = XLSX.utils.book_new();

  // 1. Summary Sheet
  const summaryHeaders: (string | number)[] = [
    "Laporan Bulanan",
    `${new Date(reportData.startDate).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })} s.d. ${new Date(reportData.endDate).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })}`,
  ];

  const emptyRow: (string | number)[] = [""];

  const summaryRows: (string | number)[][] = [
    ["Total Orders", reportData.totalOrders],
    ["Total Pendapatan", formatCurrency(reportData.totalRevenue)],
    ["Total Pengeluaran", formatCurrency(reportData.totalExpenses)],
    ["Keuntungan", formatCurrency(reportData.totalProfit)],
    emptyRow,
    ["Ringkasan Status Order Bulanan", ""],
    ["Pending", reportData.ordersByStatus.pending],
    ["Processing", reportData.ordersByStatus.processing],
    ["Selesai", reportData.ordersByStatus.finished],
    ["Dibatalkan", reportData.ordersByStatus.canceled],
  ];

  const summaryData: (string | number)[][] = [
    summaryHeaders,
    emptyRow,
    ...summaryRows,
  ];

  const summaryWs = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(wb, summaryWs, "Ringkasan Bulanan");

  // 2. Top Selling Products Sheet
  if (reportData.topSellingProducts.length > 0) {
    const topProductsHeaders: (string | number)[] = [
      "Nama Produk",
      "Jumlah Terjual",
      "Total Pendapatan",
    ];

    // Helper function to ensure type safety
    const createTopProductRow = (
      product: (typeof reportData.topSellingProducts)[number],
    ): (string | number)[] => {
      const nameStr: string = product.name;
      const totalSoldNum: number = product.totalSold;
      const totalRevenueNum: number = product.totalRevenue;

      return [nameStr, totalSoldNum, totalRevenueNum];
    };

    const topProductsRows: (string | number)[][] =
      reportData.topSellingProducts.map(createTopProductRow);
    const topProductsData: (string | number)[][] = [
      topProductsHeaders,
      ...topProductsRows,
    ];

    const topProductsWs = XLSX.utils.aoa_to_sheet(topProductsData);
    XLSX.utils.book_append_sheet(
      wb,
      topProductsWs,
      "Produk Terlaris Bulan Ini",
    );
  }

  // 3. Orders Sheet
  if (reportData.orders.length > 0) {
    const ordersHeaders: (string | number)[] = [
      "Waktu",
      "No. Order",
      "Pelanggan",
      "Status",
      "Total",
    ];

    // Helper function to ensure type safety
    const createOrderRow = (
      order: (typeof reportData.orders)[number],
    ): (string | number)[] => {
      const dateStr: string = order.createdAt
        ? new Date(order.createdAt).toLocaleDateString("id-ID")
        : "";
      const orderNumberStr: string = order.orderNumber;
      const userNameStr: string = order.user.name;
      const statusStr: string = order.status;
      const totalAmountNum: number = order.totalAmount;

      return [dateStr, orderNumberStr, userNameStr, statusStr, totalAmountNum];
    };

    const ordersRows: (string | number)[][] =
      reportData.orders.map(createOrderRow);
    const ordersData: (string | number)[][] = [ordersHeaders, ...ordersRows];

    const ordersWs = XLSX.utils.aoa_to_sheet(ordersData);
    XLSX.utils.book_append_sheet(wb, ordersWs, "Rincian Pendapatan Bulan Ini");
  }

  // 4. Expenses Sheet
  if (reportData.expenses.length > 0) {
    const expensesHeaders: (string | number)[] = [
      "Waktu",
      "Kategori",
      "Deskripsi",
      "Nominal",
    ];

    // Helper function to ensure type safety
    const createExpenseRow = (
      expense: (typeof reportData.expenses)[number],
    ): (string | number)[] => {
      const dateStr: string = expense.date
        ? new Date(expense.date).toLocaleDateString("id-ID")
        : "";
      const categoryStr: string = capitalizeFirstLetter(expense.category);
      const descriptionStr: string = expense.description || "-";
      const nominalNum: number = expense.nominal;

      return [dateStr, categoryStr, descriptionStr, nominalNum];
    };

    const expensesRows: (string | number)[][] =
      reportData.expenses.map(createExpenseRow);
    const expensesData: (string | number)[][] = [
      expensesHeaders,
      ...expensesRows,
    ];

    const expensesWs = XLSX.utils.aoa_to_sheet(expensesData);
    XLSX.utils.book_append_sheet(
      wb,
      expensesWs,
      "Rincian Pengeluaran Bulan Ini",
    );
  }

  // Save the workbook
  const fileName = `laporan-bulanan-${startDate.toISOString().split("T")[0]}-${endDate.toISOString().split("T")[0]}.xlsx`;
  XLSX.writeFile(wb, fileName);
}

/**
 * Exports annual report data to Excel format
 * @param reportData The annual report data to export
 * @param year The year of the report
 */
export async function exportAnnualReportToExcel(
  reportData: AnnualReportData,
  year: number,
): Promise<void> {
  // Dynamically import xlsx (SheetJS) to avoid SSR issues
  const XLSX = await import("xlsx");

  // Create a new workbook
  const wb = XLSX.utils.book_new();

  // 1. Summary Sheet
  const summaryHeaders: (string | number)[] = [
    "Laporan Tahunan",
    `Tahun ${reportData.year}`,
  ];

  const emptyRow: (string | number)[] = [""];

  const summaryRows: (string | number)[][] = [
    ["Total Orders", reportData.totalOrders],
    ["Total Pendapatan", formatCurrency(reportData.totalRevenue)],
    ["Total Pengeluaran", formatCurrency(reportData.totalExpenses)],
    ["Keuntungan", formatCurrency(reportData.totalProfit)],
    emptyRow,
    ["Ringkasan Status Order Tahunan", ""],
    ["Pending", reportData.ordersByStatus.pending],
    ["Processing", reportData.ordersByStatus.processing],
    ["Selesai", reportData.ordersByStatus.finished],
    ["Dibatalkan", reportData.ordersByStatus.canceled],
  ];

  const summaryData: (string | number)[][] = [
    summaryHeaders,
    emptyRow,
    ...summaryRows,
  ];

  const summaryWs = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(wb, summaryWs, "Ringkasan Tahunan");

  // 2. Top Selling Products Sheet
  if (reportData.topSellingProducts.length > 0) {
    const topProductsHeaders: (string | number)[] = [
      "Nama Produk",
      "Jumlah Terjual",
      "Total Pendapatan",
    ];

    // Helper function to ensure type safety
    const createTopProductRow = (
      product: (typeof reportData.topSellingProducts)[number],
    ): (string | number)[] => {
      const nameStr: string = product.name;
      const totalSoldNum: number = product.totalSold;
      const totalRevenueNum: number = product.totalRevenue;

      return [nameStr, totalSoldNum, totalRevenueNum];
    };

    const topProductsRows: (string | number)[][] =
      reportData.topSellingProducts.map(createTopProductRow);
    const topProductsData: (string | number)[][] = [
      topProductsHeaders,
      ...topProductsRows,
    ];

    const topProductsWs = XLSX.utils.aoa_to_sheet(topProductsData);
    XLSX.utils.book_append_sheet(
      wb,
      topProductsWs,
      "Produk Terlaris Tahun Ini",
    );
  }

  // 3. Orders Sheet
  if (reportData.orders.length > 0) {
    const ordersHeaders: (string | number)[] = [
      "Waktu",
      "No. Order",
      "Pelanggan",
      "Status",
      "Total",
    ];

    // Helper function to ensure type safety
    const createOrderRow = (
      order: (typeof reportData.orders)[number],
    ): (string | number)[] => {
      const dateStr: string = order.createdAt
        ? new Date(order.createdAt).toLocaleDateString("id-ID")
        : "";
      const orderNumberStr: string = order.orderNumber;
      const userNameStr: string = order.user.name;
      const statusStr: string = order.status;
      const totalAmountNum: number = order.totalAmount;

      return [dateStr, orderNumberStr, userNameStr, statusStr, totalAmountNum];
    };

    const ordersRows: (string | number)[][] =
      reportData.orders.map(createOrderRow);
    const ordersData: (string | number)[][] = [ordersHeaders, ...ordersRows];

    const ordersWs = XLSX.utils.aoa_to_sheet(ordersData);
    XLSX.utils.book_append_sheet(wb, ordersWs, "Rincian Pendapatan Tahun Ini");
  }

  // 4. Expenses Sheet
  if (reportData.expenses.length > 0) {
    const expensesHeaders: (string | number)[] = [
      "Waktu",
      "Kategori",
      "Deskripsi",
      "Nominal",
    ];

    // Helper function to ensure type safety
    const createExpenseRow = (
      expense: (typeof reportData.expenses)[number],
    ): (string | number)[] => {
      const dateStr: string = expense.date
        ? new Date(expense.date).toLocaleDateString("id-ID")
        : "";
      const categoryStr: string = capitalizeFirstLetter(expense.category);
      const descriptionStr: string = expense.description || "-";
      const nominalNum: number = expense.nominal;

      return [dateStr, categoryStr, descriptionStr, nominalNum];
    };

    const expensesRows: (string | number)[][] =
      reportData.expenses.map(createExpenseRow);
    const expensesData: (string | number)[][] = [
      expensesHeaders,
      ...expensesRows,
    ];

    const expensesWs = XLSX.utils.aoa_to_sheet(expensesData);
    XLSX.utils.book_append_sheet(
      wb,
      expensesWs,
      "Rincian Pengeluaran Tahun Ini",
    );
  }

  // Save the workbook
  const fileName = `laporan-tahunan-${year}.xlsx`;
  XLSX.writeFile(wb, fileName);
}

/**
 * Exports customer report data to Excel format
 * @param reportData The customer report data to export
 * @param startDate The start date of the report
 * @param endDate The end date of the report
 */
export async function exportCustomerReportToExcel(
  reportData: CustomerReportData,
  startDate: Date,
  endDate: Date,
): Promise<void> {
  // Dynamically import xlsx (SheetJS) to avoid SSR issues
  const XLSX = await import("xlsx");

  // Create a new workbook
  const wb = XLSX.utils.book_new();

  // 1. Summary Sheet
  const summaryHeaders: (string | number)[] = [
    "Laporan Pelanggan",
    `${new Date(reportData.startDate).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })} s.d. ${new Date(reportData.endDate).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })}`,
  ];

  const emptyRow: (string | number)[] = [""];

  // Count orders by status from customerOrders
  const ordersByStatus = {
    pending: reportData.customerOrders.filter(
      (order) => order.status === "pending",
    ).length,
    processing: reportData.customerOrders.filter(
      (order) => order.status === "processing",
    ).length,
    finished: reportData.customerOrders.filter(
      (order) => order.status === "finished",
    ).length,
    canceled: reportData.customerOrders.filter(
      (order) => order.status === "canceled",
    ).length,
  };

  const summaryRows: (string | number)[][] = [
    ["Total Pelanggan", reportData.totalCustomers],
    ["Total Orders", reportData.totalOrders],
    ["Total Pendapatan", formatCurrency(reportData.totalRevenue)],
    ["Rata-rata Nilai Pesanan", formatCurrency(reportData.averageOrderValue)],
    emptyRow,
    ["Ringkasan Status Order", ""],
    ["Pending", ordersByStatus.pending],
    ["Processing", ordersByStatus.processing],
    ["Selesai", ordersByStatus.finished],
    ["Dibatalkan", ordersByStatus.canceled],
  ];

  const summaryData: (string | number)[][] = [
    summaryHeaders,
    emptyRow,
    ...summaryRows,
  ];

  const summaryWs = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(wb, summaryWs, "Ringkasan Pelanggan");

  // 2. Top Customers Sheet
  if (reportData.topCustomers.length > 0) {
    const topCustomersHeaders: (string | number)[] = [
      "Nama Pelanggan",
      "No. Telepon",
      "Total Orders",
      "Total Pengeluaran",
      "Rata-rata Nilai Pesanan",
    ];

    // Helper function to ensure type safety
    const createTopCustomerRow = (
      customer: (typeof reportData.topCustomers)[number],
    ): (string | number)[] => {
      const nameStr: string = customer.name;
      const phoneStr: string = customer.phone;
      const totalOrdersNum: number = customer.totalOrders;
      const totalSpentNum: number = customer.totalSpent;
      const averageOrderValueNum: number = customer.averageOrderValue;

      return [
        nameStr,
        phoneStr,
        totalOrdersNum,
        totalSpentNum,
        averageOrderValueNum,
      ];
    };

    const topCustomersRows: (string | number)[][] =
      reportData.topCustomers.map(createTopCustomerRow);
    const topCustomersData: (string | number)[][] = [
      topCustomersHeaders,
      ...topCustomersRows,
    ];

    const topCustomersWs = XLSX.utils.aoa_to_sheet(topCustomersData);
    XLSX.utils.book_append_sheet(wb, topCustomersWs, "Pelanggan Terbaik");
  }

  // 3. Customer Orders Sheet
  if (reportData.customerOrders.length > 0) {
    const customerOrdersHeaders: (string | number)[] = [
      "Waktu",
      "No. Order",
      "Pelanggan",
      "No. Telepon",
      "Status",
      "Total",
    ];

    // Helper function to ensure type safety
    const createCustomerOrderRow = (
      order: (typeof reportData.customerOrders)[number],
    ): (string | number)[] => {
      const dateStr: string = order.createdAt
        ? new Date(order.createdAt).toLocaleDateString("id-ID")
        : "";
      const orderNumberStr: string = order.orderNumber;
      const customerNameStr: string = order.customerName;
      const customerPhoneStr: string = order.customerPhone;
      const statusStr: string = order.status;
      const totalAmountNum: number = order.totalAmount;

      return [
        dateStr,
        orderNumberStr,
        customerNameStr,
        customerPhoneStr,
        statusStr,
        totalAmountNum,
      ];
    };

    const customerOrdersRows: (string | number)[][] =
      reportData.customerOrders.map(createCustomerOrderRow);
    const customerOrdersData: (string | number)[][] = [
      customerOrdersHeaders,
      ...customerOrdersRows,
    ];

    const customerOrdersWs = XLSX.utils.aoa_to_sheet(customerOrdersData);
    XLSX.utils.book_append_sheet(
      wb,
      customerOrdersWs,
      "Rincian Pesanan Pelanggan",
    );
  }

  // Save the workbook
  const fileName = `laporan-pelanggan-${startDate.toISOString().split("T")[0]}-${endDate.toISOString().split("T")[0]}.xlsx`;
  XLSX.writeFile(wb, fileName);
}

/**
 * Exports product report data to Excel format
 * @param reportData The product report data to export
 * @param startDate The start date of the report
 * @param endDate The end date of the report
 */
export async function exportProductReportToExcel(
  reportData: ProductReportData,
  startDate: Date,
  endDate: Date,
): Promise<void> {
  // Dynamically import xlsx (SheetJS) to avoid SSR issues
  const XLSX = await import("xlsx");

  // Create a new workbook
  const wb = XLSX.utils.book_new();

  // 1. Summary Sheet
  const summaryHeaders: (string | number)[] = [
    "Laporan Produk",
    `${new Date(reportData.startDate).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })} s.d. ${new Date(reportData.endDate).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })}`,
  ];

  const emptyRow: (string | number)[] = [""];

  const summaryRows: (string | number)[][] = [
    ["Total Produk", reportData.totalProducts],
    ["Total Terjual", reportData.totalSold],
    ["Total Pendapatan", formatCurrency(reportData.totalRevenue)],
    [
      "Harga Rata-rata",
      formatCurrency(
        reportData.totalSold > 0
          ? reportData.totalRevenue / reportData.totalSold
          : 0,
      ),
    ],
    emptyRow,
    ["Ringkasan Penjualan Produk", ""],
    ["Produk Terlaris", reportData.topSellingProducts.length],
  ];

  const summaryData: (string | number)[][] = [
    summaryHeaders,
    emptyRow,
    ...summaryRows,
  ];

  const summaryWs = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(wb, summaryWs, "Ringkasan Produk");

  // 2. Top Selling Products Sheet
  if (reportData.topSellingProducts.length > 0) {
    const topProductsHeaders: (string | number)[] = [
      "Nama Produk",
      "Kode Dasar",
      "Kategori",
      "Jumlah Terjual",
      "Total Pendapatan",
      "Harga Rata-rata",
    ];

    // Helper function to ensure type safety
    const createTopProductRow = (
      product: (typeof reportData.topSellingProducts)[number],
    ): (string | number)[] => {
      const nameStr: string = product.name;
      const baseCodeStr: string = product.baseCode;
      const categoryStr: string = product.category;
      const totalSoldNum: number = product.totalSold;
      const totalRevenueNum: number = product.totalRevenue;
      const averagePriceNum: number =
        product.totalSold > 0 ? product.totalRevenue / product.totalSold : 0;

      return [
        nameStr,
        baseCodeStr,
        categoryStr,
        totalSoldNum,
        totalRevenueNum,
        averagePriceNum,
      ];
    };

    const topProductsRows: (string | number)[][] =
      reportData.topSellingProducts.map(createTopProductRow);
    const topProductsData: (string | number)[][] = [
      topProductsHeaders,
      ...topProductsRows,
    ];

    const topProductsWs = XLSX.utils.aoa_to_sheet(topProductsData);
    XLSX.utils.book_append_sheet(wb, topProductsWs, "Produk Terlaris");
  }

  // 3. Product Sales Sheet
  if (reportData.productSales.length > 0) {
    const productSalesHeaders: (string | number)[] = [
      "Nama Produk",
      "Kode Dasar",
      "Kategori",
      "Jumlah Terjual",
      "Total Pendapatan",
    ];

    // Helper function to ensure type safety
    const createProductSaleRow = (
      product: (typeof reportData.productSales)[number],
    ): (string | number)[] => {
      const nameStr: string = product.productName;
      const baseCodeStr: string = product.baseCode;
      const categoryStr: string = product.category;
      const totalSoldNum: number = product.totalSold;
      const totalRevenueNum: number = product.totalRevenue;

      return [nameStr, baseCodeStr, categoryStr, totalSoldNum, totalRevenueNum];
    };

    const productSalesRows: (string | number)[][] =
      reportData.productSales.map(createProductSaleRow);
    const productSalesData: (string | number)[][] = [
      productSalesHeaders,
      ...productSalesRows,
    ];

    const productSalesWs = XLSX.utils.aoa_to_sheet(productSalesData);
    XLSX.utils.book_append_sheet(wb, productSalesWs, "Penjualan Produk");
  }

  // Save the workbook
  const fileName = `laporan-produk-${startDate.toISOString().split("T")[0]}-${endDate.toISOString().split("T")[0]}.xlsx`;
  XLSX.writeFile(wb, fileName);
}

/**
 * Exports revenue report data to Excel format
 * @param reportData The revenue report data to export
 * @param startDate The start date of the report
 * @param endDate The end date of the report
 */
export async function exportRevenueReportToExcel(
  reportData: RevenueReportData,
  startDate: Date,
  endDate: Date,
): Promise<void> {
  const XLSX = await import("xlsx");
  // Create a new workbook
  const wb = XLSX.utils.book_new();

  // Add summary sheet
  const summaryHeaders: (string | number)[] = [
    "Tanggal Laporan",
    "Total Pendapatan",
    "Total Pengeluaran",
    "Pendapatan Bersih",
    "Total Order",
  ];

  // Format dates for the summary row
  const formattedStartDate = reportData.startDate
    ? new Date(reportData.startDate).toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    : "";
  const formattedEndDate = reportData.endDate
    ? new Date(reportData.endDate).toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    : "";

  const summaryRow: (string | number)[] = [
    `${formattedStartDate} s.d. ${formattedEndDate}`,
    reportData.totalRevenue,
    reportData.totalExpenses,
    reportData.netRevenue,
    reportData.totalOrders,
  ];

  const summaryData: (string | number)[][] = [summaryHeaders, summaryRow];
  const summaryWs = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(wb, summaryWs, "Ringkasan");

  // Add top revenue products sheet if there are any
  if (reportData.topRevenueProducts.length > 0) {
    const topProductsHeaders: (string | number)[] = [
      "#",
      "Nama Produk",
      "Jumlah Terjual",
      "Total Pendapatan",
    ];

    // Helper function to ensure type safety
    const createTopProductRow = (
      product: (typeof reportData.topRevenueProducts)[number],
    ): (string | number)[] => {
      const idNum: number = product.id;
      const nameStr: string = product.name;
      const totalSoldNum: number = product.totalSold;
      const totalRevenueNum: number = product.totalRevenue;

      return [idNum, nameStr, totalSoldNum, totalRevenueNum];
    };

    const topProductsRows: (string | number)[][] =
      reportData.topRevenueProducts.map(createTopProductRow);
    const topProductsData: (string | number)[][] = [
      topProductsHeaders,
      ...topProductsRows,
    ];

    const topProductsWs = XLSX.utils.aoa_to_sheet(topProductsData);
    XLSX.utils.book_append_sheet(
      wb,
      topProductsWs,
      "Produk Pendapatan Tertinggi",
    );
  }

  // Add orders sheet if there are any orders
  if (reportData.orders.length > 0) {
    const ordersHeaders: (string | number)[] = [
      "#",
      "No. Order",
      "Status",
      "Metode Pembayaran",
      "Jumlah",
      "Nama Kasir",
      "Tanggal",
    ];

    // Helper function to ensure type safety
    const createOrderRow = (
      order: (typeof reportData.orders)[number],
    ): (string | number)[] => {
      const indexNum: number = order.id;
      const orderNumberStr: string = order.orderNumber;
      const statusStr: string = order.status;
      const paymentMethodStr: string = order.paymentMethod;
      const totalAmountNum: number = order.totalAmount;
      const cashierNameStr: string = order.user.name;
      const dateStr: string = order.createdAt
        ? new Date(order.createdAt).toLocaleDateString("id-ID", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          })
        : "";

      return [
        indexNum,
        orderNumberStr,
        statusStr,
        paymentMethodStr,
        totalAmountNum,
        cashierNameStr,
        dateStr,
      ];
    };

    const ordersRows: (string | number)[][] =
      reportData.orders.map(createOrderRow);
    const ordersData: (string | number)[][] = [ordersHeaders, ...ordersRows];

    const ordersWs = XLSX.utils.aoa_to_sheet(ordersData);
    XLSX.utils.book_append_sheet(wb, ordersWs, "Daftar Order");
  }

  // Save the workbook
  const fileName = `laporan-pendapatan-${startDate.toISOString().split("T")[0]}-${endDate.toISOString().split("T")[0]}.xlsx`;
  XLSX.writeFile(wb, fileName);
}

/**
 * Exports expense report data to Excel format
 * @param reportData The expense report data to export
 * @param startDate The start date of the report
 * @param endDate The end date of the report
 */
export async function exportExpenseReportToExcel(
  reportData: ExpenseReportData,
  startDate: Date,
  endDate: Date,
): Promise<void> {
  const XLSX = await import("xlsx");
  // Create a new workbook
  const wb = XLSX.utils.book_new();

  // Add summary sheet
  const summaryHeaders: (string | number)[] = [
    "Tanggal Laporan",
    "Total Pengeluaran",
    "Total Pendapatan",
    "Total Pesanan",
  ];

  // Format dates for the summary row
  const formattedStartDate = reportData.startDate
    ? new Date(reportData.startDate).toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    : "";
  const formattedEndDate = reportData.endDate
    ? new Date(reportData.endDate).toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    : "";

  const summaryRow: (string | number)[] = [
    `${formattedStartDate} s.d. ${formattedEndDate}`,
    reportData.totalExpenses,
    reportData.totalRevenue,
    reportData.totalOrders,
  ];

  const summaryData: (string | number)[][] = [summaryHeaders, summaryRow];
  const summaryWs = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(wb, summaryWs, "Ringkasan");

  // Add expense categories sheet
  const categoriesHeaders: (string | number)[] = ["#", "Kategori", "Jumlah"];

  const categoriesRows: (string | number)[][] = [
    [1, "Operasional", reportData.expenseCategories?.operational || 0],
    [2, "Marketing", reportData.expenseCategories?.marketing || 0],
    [3, "Gaji", reportData.expenseCategories?.gaji || 0],
    [4, "Lainnya", reportData.expenseCategories?.lainnya || 0],
  ];
  const categoriesData: (string | number)[][] = [
    categoriesHeaders,
    ...categoriesRows,
  ];

  const categoriesWs = XLSX.utils.aoa_to_sheet(categoriesData);
  XLSX.utils.book_append_sheet(wb, categoriesWs, "Kategori Pengeluaran");

  // Add expenses sheet if there are any expenses
  if (reportData.expenses.length > 0) {
    const expensesHeaders: (string | number)[] = [
      "#",
      "Kategori",
      "Nominal",
      "Deskripsi",
      "Tanggal",
    ];

    // Helper function to ensure type safety
    const createExpenseRow = (
      expense: (typeof reportData.expenses)[number],
    ): (string | number)[] => {
      const indexNum: number = expense.id;
      const categoryStr: string =
        expense.category === "operasional"
          ? "Operasional"
          : expense.category === "marketing"
            ? "Marketing"
            : expense.category === "gaji"
              ? "Gaji"
              : "Lainnya";
      const nominalNum: number = expense.nominal;
      const descriptionStr: string = expense.description || "-";
      const dateStr: string = expense.date
        ? new Date(expense.date).toLocaleDateString("id-ID", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          })
        : "";

      return [indexNum, categoryStr, nominalNum, descriptionStr, dateStr];
    };

    const expensesRows: (string | number)[][] =
      reportData.expenses.map(createExpenseRow);
    const expensesData: (string | number)[][] = [
      expensesHeaders,
      ...expensesRows,
    ];

    const expensesWs = XLSX.utils.aoa_to_sheet(expensesData);
    XLSX.utils.book_append_sheet(wb, expensesWs, "Daftar Pengeluaran");
  }

  // Save the workbook
  const fileName = `laporan-pengeluaran-${startDate.toISOString().split("T")[0]}-${endDate.toISOString().split("T")[0]}.xlsx`;
  XLSX.writeFile(wb, fileName);
}

/**
 * Exports margin report data to Excel format
 * @param reportData The margin report data to export
 * @param startDate The start date of the report
 * @param endDate The end date of the report
 */
export async function exportMarginReportToExcel(
  reportData: MarginReportData,
  startDate: Date,
  endDate: Date,
): Promise<void> {
  const XLSX = await import("xlsx");
  // Create a new workbook
  const wb = XLSX.utils.book_new();

  // Add summary sheet
  const summaryHeaders: (string | number)[] = [
    "Tanggal Laporan",
    "Total Pendapatan",
    "Total Biaya",
    "Total Laba",
    "Gross Margin (%)",
    "Net Margin (%)",
  ];

  // Format dates for the summary row
  const formattedStartDate = reportData.startDate
    ? new Date(reportData.startDate).toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    : "";
  const formattedEndDate = reportData.endDate
    ? new Date(reportData.endDate).toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    : "";

  const summaryRow: (string | number)[] = [
    `${formattedStartDate} s.d. ${formattedEndDate}`,
    reportData.totalRevenue,
    reportData.totalCost,
    reportData.totalProfit,
    reportData.grossMargin,
    reportData.netMargin,
  ];

  const summaryData: (string | number)[][] = [summaryHeaders, summaryRow];
  const summaryWs = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(wb, summaryWs, "Ringkasan");

  // Add product margins sheet if there are any
  if (reportData.productMargins.length > 0) {
    const marginsHeaders: (string | number)[] = [
      "#",
      "Nama Produk",
      "Biaya",
      "Pendapatan",
      "Laba",
      "Margin (%)",
      "Jumlah Terjual",
    ];

    // Helper function to ensure type safety
    const createMarginRow = (
      product: (typeof reportData.productMargins)[number],
    ): (string | number)[] => {
      const indexNum: number = product.id;
      const nameStr: string = product.name;
      const costNum: number = product.cost;
      const revenueNum: number = product.revenue;
      const profitNum: number = product.profit;
      const marginNum: number = product.margin;
      const totalSoldNum: number = product.totalSold;

      return [
        indexNum,
        nameStr,
        costNum,
        revenueNum,
        profitNum,
        marginNum,
        totalSoldNum,
      ];
    };

    const marginsRows: (string | number)[][] =
      reportData.productMargins.map(createMarginRow);
    const marginsData: (string | number)[][] = [marginsHeaders, ...marginsRows];

    const marginsWs = XLSX.utils.aoa_to_sheet(marginsData);
    XLSX.utils.book_append_sheet(wb, marginsWs, "Margin Produk");
  }

  // Add orders sheet if there are any orders
  if (reportData.orders.length > 0) {
    const ordersHeaders: (string | number)[] = [
      "#",
      "No. Order",
      "Total",
      "Biaya",
      "Laba",
      "Margin (%)",
      "Tanggal",
    ];

    // Helper function to ensure type safety
    const createOrderRow = (
      order: (typeof reportData.orders)[0], // Use proper typing for order
    ): (string | number)[] => {
      const indexNum: number = order.id;
      const orderNumberStr: string = order.orderNumber;
      const totalNum: number = order.totalAmount;
      const costNum: number = order.cost;
      const profitNum: number = order.profit;
      const marginNum: number = order.margin;
      const dateStr: string = order.createdAt
        ? new Date(order.createdAt).toLocaleDateString("id-ID", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          })
        : "";

      return [
        indexNum,
        orderNumberStr,
        totalNum,
        costNum,
        profitNum,
        marginNum,
        dateStr,
      ];
    };

    const ordersRows: (string | number)[][] =
      reportData.orders.map(createOrderRow);
    const ordersData: (string | number)[][] = [ordersHeaders, ...ordersRows];

    const ordersWs = XLSX.utils.aoa_to_sheet(ordersData);
    XLSX.utils.book_append_sheet(wb, ordersWs, "Daftar Pesanan");
  }

  // Save the workbook
  const fileName = `laporan-margin-${startDate.toISOString().split("T")[0]}-${endDate.toISOString().split("T")[0]}.xlsx`;
  XLSX.writeFile(wb, fileName);
}
