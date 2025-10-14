// Utility functions for Excel export
import type { DailyReportData, WeeklyReportData } from "$lib/types";

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
      const dateStr: string = new Date(order.createdAt).toLocaleDateString(
        "id-ID",
      );
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
      const dateStr: string = new Date(expense.date).toLocaleDateString(
        "id-ID",
      );
      const categoryStr: string =
        expense.category.charAt(0).toUpperCase() + expense.category.slice(1);
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
      const dateStr: string = new Date(order.createdAt).toLocaleDateString(
        "id-ID",
      );
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
      const dateStr: string = new Date(expense.date).toLocaleDateString(
        "id-ID",
      );
      const categoryStr: string =
        expense.category.charAt(0).toUpperCase() + expense.category.slice(1);
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

// Helper function to format currency
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}
