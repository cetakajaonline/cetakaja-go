// Utility functions for PDF export
import type {
  DailyReportData,
  WeeklyReportData,
  MonthlyReportData,
  AnnualReportData,
  CustomerReportData,
  ProductReportData,
} from "$lib/types";

import { formatCurrency } from "./formatters";

/**
 * Exports daily report data to PDF format
 * @param reportData The daily report data to export
 * @param reportDate The date of the report
 */
export async function exportDailyReportToPDF(
  reportData: DailyReportData,
  reportDate: Date,
): Promise<void> {
  try {
    // Dynamically import jsPDF and autotable plugin to avoid SSR issues
    const jsPDFModule = await import("jspdf");
    const { jsPDF } = jsPDFModule;
    const autoTable = (await import("jspdf-autotable")).default;

    // Create a new PDF document
    const doc = new jsPDF();

    // Add title
    const title = `Laporan Harian - ${new Date(
      reportData.date,
    ).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })}`;

    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text(title, doc.internal.pageSize.width / 2, 20, { align: "center" });
    doc.setFont("helvetica", "normal");

    // Add summary information section with better layout
    doc.setFontSize(12);
    const summaryStartX = 20;
    const summaryY = 35; // Starting Y position for summary section

    // Add a header for Ringkasan Laporan
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    const summaryHeader = "Ringkasan Laporan";
    doc.setTextColor(0, 0, 0);
    doc.text(summaryHeader, doc.internal.pageSize.width / 2, summaryY, {
      align: "center",
    }); // Center text
    doc.setTextColor(0, 0, 0); // Reset text color
    doc.setFont("helvetica", "normal");

    doc.text(
      `Total Orders: ${reportData.totalOrders}`,
      summaryStartX,
      summaryY + 10,
    );
    doc.text(
      `Total Pendapatan: ${formatCurrency(reportData.totalRevenue)}`,
      summaryStartX,
      summaryY + 20,
    );
    doc.text(
      `Total Pengeluaran: ${formatCurrency(reportData.totalExpenses)}`,
      summaryStartX + 95,
      summaryY + 10,
    );
    doc.text(
      `Keuntungan: ${formatCurrency(reportData.totalProfit)}`,
      summaryStartX + 95,
      summaryY + 20,
    );

    // Add order status summary - positioned below summary section with adequate spacing
    const statusY = summaryY + 45; // Space below summary section

    // Add a header for Status Order
    doc.setFont("helvetica", "bold");
    const statusHeader = "Status Order";
    doc.setTextColor(0, 0, 0);
    doc.text(statusHeader, doc.internal.pageSize.width / 2, statusY, {
      align: "center",
    }); // Center text
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0, 0, 0); // Reset text color

    // Organize status in a grid layout with colored indicators
    const statusItems = [
      {
        label: "Pending",
        value: reportData.ordersByStatus.pending,
        color: [255, 165, 0],
      }, // Orange
      {
        label: "Processing",
        value: reportData.ordersByStatus.processing,
        color: [65, 105, 225],
      }, // Royal Blue
      {
        label: "Selesai",
        value: reportData.ordersByStatus.finished,
        color: [34, 139, 34],
      }, // Forest Green
      {
        label: "Dibatalkan",
        value: reportData.ordersByStatus.canceled,
        color: [220, 20, 60],
      }, // Crimson
    ];

    const itemWidth = 45; // Width for each status item (180/4)
    const statusStartX = 20; // Starting X position for status items

    for (let i = 0; i < statusItems.length; i++) {
      const item = statusItems[i];
      const itemX = statusStartX + i * itemWidth;

      // Draw colored indicator
      doc.setFillColor(item.color[0], item.color[1], item.color[2]);
      doc.rect(itemX, statusY + 8, 6, 6, "F");

      // Draw status text with colored label
      doc.setTextColor(item.color[0], item.color[1], item.color[2]);
      doc.setFont("helvetica", "bold");
      doc.text(item.label, itemX + 8, statusY + 10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(0, 0, 0); // Reset to black

      // Draw the value
      doc.text(item.value.toString(), itemX + 8, statusY + 20);
    }

    // Add top selling products table
    if (reportData.topSellingProducts.length > 0) {
      const topProductsStartY = statusY + 42; // Space below status section

      // Check if there's enough space for the header and table before adding it
      const pageHeight = doc.internal.pageSize.height;
      const footerMargin = 30; // Space needed for footer and bottom margin
      const estimatedTopProductsTableHeight =
        (reportData.topSellingProducts.length + 3) * 10; // +3 for header row and spacing
      let topProductsCurrentY = topProductsStartY;

      // Check if header position + estimated table height would exceed available space
      if (
        topProductsCurrentY + estimatedTopProductsTableHeight >
        pageHeight - footerMargin
      ) {
        doc.addPage();
        topProductsCurrentY = 20; // Start from top of new page
      }

      // Add header for top products with centered text
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      const topProductsHeader = "Produk Terlaris";
      doc.setTextColor(0, 0, 0);
      doc.text(
        topProductsHeader,
        doc.internal.pageSize.width / 2,
        topProductsCurrentY,
        { align: "center" },
      ); // Center text
      doc.setFont("helvetica", "normal");
      doc.setTextColor(0, 0, 0); // Reset text color

      // Prepare data for the table
      const topProductsData: string[][] = reportData.topSellingProducts.map(
        (product) => {
          const row: string[] = [
            product.name,
            product.totalSold.toString(),
            formatCurrency(product.totalRevenue),
          ];
          return row;
        },
      );

      // Add table for top products with improved styling
      autoTable(doc, {
        head: [["Nama Produk", "Terjual", "Total Pendapatan"]],
        body: topProductsData,
        startY: topProductsCurrentY + 12, // Start below the header using current Y position
        theme: "grid",
        headStyles: {
          fillColor: [66, 133, 244], // Google Blue
          textColor: [255, 255, 255],
          fontSize: 11,
          fontStyle: "bold",
        },
        bodyStyles: {
          fontSize: 10,
          cellPadding: 5,
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245],
        },
        tableWidth: "wrap",
        columnStyles: {
          0: { cellWidth: "auto" }, // Product name column - auto adjust
          1: { cellWidth: "auto", halign: "center" }, // Quantity column - auto adjust
          2: { cellWidth: "auto", halign: "right" }, // Amount column - auto adjust
        },
      });
    }

    // Add orders table if there are orders
    if (reportData.orders.length > 0) {
      // Calculate Y position based on previous elements or last auto table
      let ordersStartY = 150; // Default position if no previous elements
      if (reportData.topSellingProducts.length > 0) {
        // Position after top products table
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if ((doc as any).lastAutoTable) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ordersStartY = (doc as any).lastAutoTable.finalY + 15; // Space below previous table
        }
      } else {
        // Position after status section if no top products
        ordersStartY = statusY + 42 + 15; // Space below status section
      }

      // Check if there's enough space for the header and table before adding it
      const pageHeight = doc.internal.pageSize.height;
      const footerMargin = 30; // Space needed for footer and bottom margin
      const estimatedOrdersTableHeight = (reportData.orders.length + 3) * 10; // +3 for header row and spacing
      let ordersCurrentY = ordersStartY;

      // Check if header position + estimated table height would exceed available space
      if (
        ordersCurrentY + estimatedOrdersTableHeight >
        pageHeight - footerMargin
      ) {
        doc.addPage();
        ordersCurrentY = 20; // Start from top of new page
      }

      // Add header for orders with centered text
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      const ordersHeader = "Rincian Pendapatan";
      doc.setTextColor(0, 0, 0);
      doc.text(ordersHeader, doc.internal.pageSize.width / 2, ordersCurrentY, {
        align: "center",
      }); // Center text
      doc.setFont("helvetica", "normal");
      doc.setTextColor(0, 0, 0); // Reset text color

      // Prepare data for the table
      const ordersData: string[][] = reportData.orders.map((order) => {
        const row: string[] = [
          new Date(order.createdAt).toLocaleDateString("id-ID"),
          order.orderNumber,
          order.user?.name || "N/A",
          order.status,
          formatCurrency(order.totalAmount),
        ];
        return row;
      });

      // Add table for orders with improved styling
      autoTable(doc, {
        head: [["Waktu", "No. Order", "Pelanggan", "Status", "Total"]],
        body: ordersData,
        startY: ordersCurrentY + 12, // Start below the header using current Y position
        theme: "grid",
        headStyles: {
          fillColor: [66, 133, 244], // Google Blue
          textColor: [255, 255, 255],
          fontSize: 11,
          fontStyle: "bold",
        },
        bodyStyles: {
          fontSize: 10,
          cellPadding: 5,
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245],
        },
        tableWidth: "wrap",
        columnStyles: {
          0: { cellWidth: "auto" }, // Date column - auto adjust
          1: { cellWidth: "auto" }, // Order number column - auto adjust
          2: { cellWidth: "auto" }, // Customer name column - auto adjust
          3: { cellWidth: "auto", halign: "center" }, // Status column - auto adjust
          4: { cellWidth: "auto", halign: "right" }, // Amount column - auto adjust
        },
      });
    }

    // Add expenses table if there are expenses
    if (reportData.expenses.length > 0) {
      // Calculate Y position based on previous elements or last auto table
      let expensesStartY = 150; // Default position if no previous elements
      if (reportData.orders.length > 0) {
        // Position after orders table
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if ((doc as any).lastAutoTable) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          expensesStartY = (doc as any).lastAutoTable.finalY + 15; // Space below previous table
        }
      } else if (reportData.topSellingProducts.length > 0) {
        // Position after top products table if no orders
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if ((doc as any).lastAutoTable) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          expensesStartY = (doc as any).lastAutoTable.finalY + 15; // Space below previous table
        }
      } else {
        // Position after status section if no other elements
        expensesStartY = statusY + 42 + 15; // Space below status section
      }

      // Check if there's enough space for the header and table before adding it
      const pageHeight = doc.internal.pageSize.height;
      const footerMargin = 30; // Space needed for footer and bottom margin
      const estimatedExpensesTableHeight =
        (reportData.expenses.length + 3) * 10; // +3 for header row and spacing
      let expensesCurrentY = expensesStartY;

      // Check if header position + estimated table height would exceed available space
      if (
        expensesCurrentY + estimatedExpensesTableHeight >
        pageHeight - footerMargin
      ) {
        doc.addPage();
        expensesCurrentY = 20; // Start from top of new page
      }

      // Add header for expenses with centered text
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      const expensesHeader = "Rincian Pengeluaran";
      doc.setTextColor(0, 0, 0);
      doc.text(
        expensesHeader,
        doc.internal.pageSize.width / 2,
        expensesCurrentY,
        { align: "center" },
      ); // Center text
      doc.setFont("helvetica", "normal");
      doc.setTextColor(0, 0, 0); // Reset text color

      // Prepare data for the table
      const expensesData: string[][] = reportData.expenses.map((expense) => {
        const row: string[] = [
          new Date(expense.date).toLocaleDateString("id-ID"),
          expense.category
            ? expense.category.charAt(0).toUpperCase() +
              expense.category.slice(1)
            : "N/A",
          expense.description || "-",
          formatCurrency(expense.nominal),
        ];
        return row;
      });

      // Add table for expenses with improved styling
      autoTable(doc, {
        head: [["Waktu", "Kategori", "Deskripsi", "Nominal"]],
        body: expensesData,
        startY: expensesCurrentY + 12, // Start below the header using current Y position
        theme: "grid",
        headStyles: {
          fillColor: [219, 68, 55], // Google Red
          textColor: [255, 255, 255],
          fontSize: 11,
          fontStyle: "bold",
        },
        bodyStyles: {
          fontSize: 10,
          cellPadding: 5,
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245],
        },
        tableWidth: "wrap",
        columnStyles: {
          0: { cellWidth: "auto" }, // Date column - auto adjust
          1: { cellWidth: "auto" }, // Category column - auto adjust
          2: { cellWidth: 95, overflow: "linebreak" }, // Description column - limited width with line break
          3: { cellWidth: "auto", halign: "right" }, // Amount column - auto adjust
        },
      });
    }

    // Add footer
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.text(
        `Halaman ${i} dari ${pageCount}`,
        doc.internal.pageSize.width / 2,
        doc.internal.pageSize.height - 10,
        { align: "center" },
      );
    }

    // Save the PDF
    doc.save(`laporan-harian-${reportDate.toISOString().split("T")[0]}.pdf`);
  } catch (error) {
    console.error("Error generating PDF:", error);
    throw error; // Re-throw so the calling function can handle it
  }
}

/**
 * Exports weekly report data to PDF format
 * @param reportData The weekly report data to export
 * @param startDate The start date of the week
 * @param endDate The end date of the week
 */
export async function exportWeeklyReportToPDF(
  reportData: WeeklyReportData,
  startDate: Date,
  endDate: Date,
): Promise<void> {
  try {
    // Dynamically import jsPDF and autotable plugin to avoid SSR issues
    const jsPDFModule = await import("jspdf");
    const { jsPDF } = jsPDFModule;
    const autoTable = (await import("jspdf-autotable")).default;

    // Create a new PDF document
    const doc = new jsPDF();

    // Add title
    const title = `Laporan Mingguan - ${new Date(
      reportData.startDate,
    ).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })} s.d. ${new Date(reportData.endDate).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })}`;

    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text(title, doc.internal.pageSize.width / 2, 20, { align: "center" });
    doc.setFont("helvetica", "normal");

    // Add summary information section with better layout
    doc.setFontSize(12);
    const summaryStartX = 20;
    const summaryY = 35; // Starting Y position for summary section

    // Add a header for Ringkasan Laporan
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    const summaryHeader = "Ringkasan Laporan Mingguan";
    doc.setTextColor(0, 0, 0);
    doc.text(summaryHeader, doc.internal.pageSize.width / 2, summaryY, {
      align: "center",
    }); // Center text
    doc.setTextColor(0, 0, 0); // Reset text color
    doc.setFont("helvetica", "normal");

    doc.text(
      `Total Orders: ${reportData.totalOrders}`,
      summaryStartX,
      summaryY + 10,
    );
    doc.text(
      `Total Pendapatan: ${formatCurrency(reportData.totalRevenue)}`,
      summaryStartX,
      summaryY + 20,
    );
    doc.text(
      `Total Pengeluaran: ${formatCurrency(reportData.totalExpenses)}`,
      summaryStartX + 95,
      summaryY + 10,
    );
    doc.text(
      `Keuntungan: ${formatCurrency(reportData.totalProfit)}`,
      summaryStartX + 95,
      summaryY + 20,
    );

    // Add order status summary - positioned below summary section with adequate spacing
    const statusY = summaryY + 45; // Space below summary section

    // Add a header for Status Order
    doc.setFont("helvetica", "bold");
    const statusHeader = "Status Order";
    doc.setTextColor(0, 0, 0);
    doc.text(statusHeader, doc.internal.pageSize.width / 2, statusY, {
      align: "center",
    }); // Center text
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0, 0, 0); // Reset text color

    // Organize status in a grid layout with colored indicators
    const statusItems = [
      {
        label: "Pending",
        value: reportData.ordersByStatus.pending,
        color: [255, 165, 0],
      }, // Orange
      {
        label: "Processing",
        value: reportData.ordersByStatus.processing,
        color: [65, 105, 225],
      }, // Royal Blue
      {
        label: "Selesai",
        value: reportData.ordersByStatus.finished,
        color: [34, 139, 34],
      }, // Forest Green
      {
        label: "Dibatalkan",
        value: reportData.ordersByStatus.canceled,
        color: [220, 20, 60],
      }, // Crimson
    ];

    const itemWidth = 45; // Width for each status item (180/4)
    const statusStartX = 20; // Starting X position for status items

    for (let i = 0; i < statusItems.length; i++) {
      const item = statusItems[i];
      const itemX = statusStartX + i * itemWidth;

      // Draw colored indicator
      doc.setFillColor(item.color[0], item.color[1], item.color[2]);
      doc.rect(itemX, statusY + 8, 6, 6, "F");

      // Draw status text with colored label
      doc.setTextColor(item.color[0], item.color[1], item.color[2]);
      doc.setFont("helvetica", "bold");
      doc.text(item.label, itemX + 8, statusY + 10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(0, 0, 0); // Reset to black

      // Draw the value
      doc.text(item.value.toString(), itemX + 8, statusY + 20);
    }

    // Add top selling products table
    if (reportData.topSellingProducts.length > 0) {
      const topProductsStartY = statusY + 42; // Space below status section

      // Check if there's enough space for the header and table before adding it
      const pageHeight = doc.internal.pageSize.height;
      const footerMargin = 30; // Space needed for footer and bottom margin
      const estimatedTopProductsTableHeight =
        (reportData.topSellingProducts.length + 3) * 10; // +3 for header row and spacing
      let topProductsCurrentY = topProductsStartY;

      // Check if header position + estimated table height would exceed available space
      if (
        topProductsCurrentY + estimatedTopProductsTableHeight >
        pageHeight - footerMargin
      ) {
        doc.addPage();
        topProductsCurrentY = 20; // Start from top of new page
      }

      // Add header for top products with centered text
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      const topProductsHeader = "Produk Terlaris Minggu Ini";
      doc.setTextColor(0, 0, 0);
      doc.text(
        topProductsHeader,
        doc.internal.pageSize.width / 2,
        topProductsCurrentY,
        { align: "center" },
      ); // Center text
      doc.setFont("helvetica", "normal");
      doc.setTextColor(0, 0, 0); // Reset text color

      // Prepare data for the table
      const topProductsData: string[][] = reportData.topSellingProducts.map(
        (product) => {
          const row: string[] = [
            product.name,
            product.totalSold.toString(),
            formatCurrency(product.totalRevenue),
          ];
          return row;
        },
      );

      // Add table for top products with improved styling
      autoTable(doc, {
        head: [["Nama Produk", "Terjual", "Total Pendapatan"]],
        body: topProductsData,
        startY: topProductsCurrentY + 12, // Start below the header using current Y position
        theme: "grid",
        headStyles: {
          fillColor: [66, 133, 244], // Google Blue
          textColor: [255, 255, 255],
          fontSize: 11,
          fontStyle: "bold",
        },
        bodyStyles: {
          fontSize: 10,
          cellPadding: 5,
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245],
        },
        tableWidth: "wrap",
        columnStyles: {
          0: { cellWidth: "auto" }, // Product name column - auto adjust
          1: { cellWidth: "auto", halign: "center" }, // Quantity column - auto adjust
          2: { cellWidth: "auto", halign: "right" }, // Amount column - auto adjust
        },
      });
    }

    // Add orders table if there are orders
    if (reportData.orders.length > 0) {
      // Calculate Y position based on previous elements or last auto table
      let ordersStartY = 150; // Default position if no previous elements
      if (reportData.topSellingProducts.length > 0) {
        // Position after top products table
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if ((doc as any).lastAutoTable) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ordersStartY = (doc as any).lastAutoTable.finalY + 15; // Space below previous table
        }
      } else {
        // Position after status section if no top products
        ordersStartY = statusY + 42 + 15; // Space below status section
      }

      // Check if there's enough space for the header and table before adding it
      const pageHeight = doc.internal.pageSize.height;
      const footerMargin = 30; // Space needed for footer and bottom margin
      const estimatedOrdersTableHeight = (reportData.orders.length + 3) * 10; // +3 for header row and spacing
      let ordersCurrentY = ordersStartY;

      // Check if header position + estimated table height would exceed available space
      if (
        ordersCurrentY + estimatedOrdersTableHeight >
        pageHeight - footerMargin
      ) {
        doc.addPage();
        ordersCurrentY = 20; // Start from top of new page
      }

      // Add header for orders with centered text
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      const ordersHeader = "Rincian Pendapatan Minggu Ini";
      doc.setTextColor(0, 0, 0);
      doc.text(ordersHeader, doc.internal.pageSize.width / 2, ordersCurrentY, {
        align: "center",
      }); // Center text
      doc.setFont("helvetica", "normal");
      doc.setTextColor(0, 0, 0); // Reset text color

      // Prepare data for the table
      const ordersData: string[][] = reportData.orders.map((order) => {
        const row: string[] = [
          new Date(order.createdAt).toLocaleDateString("id-ID"),
          order.orderNumber,
          order.user?.name || "N/A",
          order.status,
          formatCurrency(order.totalAmount),
        ];
        return row;
      });

      // Add table for orders with improved styling
      autoTable(doc, {
        head: [["Waktu", "No. Order", "Pelanggan", "Status", "Total"]],
        body: ordersData,
        startY: ordersCurrentY + 12, // Start below the header using current Y position
        theme: "grid",
        headStyles: {
          fillColor: [66, 133, 244], // Google Blue
          textColor: [255, 255, 255],
          fontSize: 11,
          fontStyle: "bold",
        },
        bodyStyles: {
          fontSize: 10,
          cellPadding: 5,
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245],
        },
        tableWidth: "wrap",
        columnStyles: {
          0: { cellWidth: "auto" }, // Date column - auto adjust
          1: { cellWidth: "auto" }, // Order number column - auto adjust
          2: { cellWidth: "auto", overflow: "linebreak" }, // Customer name column - auto adjust with line break
          3: { cellWidth: "auto", halign: "center" }, // Status column - auto adjust
          4: { cellWidth: "auto", halign: "right" }, // Amount column - auto adjust
        },
      });
    }

    // Add expenses table if there are expenses
    if (reportData.expenses.length > 0) {
      // Calculate Y position based on previous elements or last auto table
      let expensesStartY = 150; // Default position if no previous elements
      if (reportData.orders.length > 0) {
        // Position after orders table
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if ((doc as any).lastAutoTable) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          expensesStartY = (doc as any).lastAutoTable.finalY + 15; // Space below previous table
        }
      } else if (reportData.topSellingProducts.length > 0) {
        // Position after top products table if no orders
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if ((doc as any).lastAutoTable) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          expensesStartY = (doc as any).lastAutoTable.finalY + 15; // Space below previous table
        }
      } else {
        // Position after status section if no other elements
        expensesStartY = statusY + 42 + 15; // Space below status section
      }

      // Check if there's enough space for the header and table before adding it
      const pageHeight = doc.internal.pageSize.height;
      const footerMargin = 30; // Space needed for footer and bottom margin
      const estimatedExpensesTableHeight =
        (reportData.expenses.length + 3) * 10; // +3 for header row and spacing
      let expensesCurrentY = expensesStartY;

      // Check if header position + estimated table height would exceed available space
      if (
        expensesCurrentY + estimatedExpensesTableHeight >
        pageHeight - footerMargin
      ) {
        doc.addPage();
        expensesCurrentY = 20; // Start from top of new page
      }

      // Add header for expenses with centered text
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      const expensesHeader = "Rincian Pengeluaran Minggu Ini";
      doc.setTextColor(0, 0, 0);
      doc.text(
        expensesHeader,
        doc.internal.pageSize.width / 2,
        expensesCurrentY,
        { align: "center" },
      ); // Center text
      doc.setFont("helvetica", "normal");
      doc.setTextColor(0, 0, 0); // Reset text color

      // Prepare data for the table
      const expensesData: string[][] = reportData.expenses.map((expense) => {
        const row: string[] = [
          new Date(expense.date).toLocaleDateString("id-ID"),
          expense.category
            ? expense.category.charAt(0).toUpperCase() +
              expense.category.slice(1)
            : "N/A",
          expense.description || "-",
          formatCurrency(expense.nominal),
        ];
        return row;
      });

      // Add table for expenses with improved styling
      autoTable(doc, {
        head: [["Waktu", "Kategori", "Deskripsi", "Nominal"]],
        body: expensesData,
        startY: expensesCurrentY + 12, // Start below the header using current Y position
        theme: "grid",
        headStyles: {
          fillColor: [219, 68, 55], // Google Red
          textColor: [255, 255, 255],
          fontSize: 11,
          fontStyle: "bold",
        },
        bodyStyles: {
          fontSize: 10,
          cellPadding: 5,
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245],
        },
        tableWidth: "wrap",
        columnStyles: {
          0: { cellWidth: "auto" }, // Date column - auto adjust
          1: { cellWidth: "auto" }, // Category column - auto adjust
          2: { cellWidth: 95, overflow: "linebreak" }, // Description column - limited width with line break
          3: { cellWidth: "auto", halign: "right" }, // Amount column - auto adjust
        },
      });
    }

    // Add footer
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.text(
        `Halaman ${i} dari ${pageCount}`,
        doc.internal.pageSize.width / 2,
        doc.internal.pageSize.height - 10,
        { align: "center" },
      );
    }

    // Save the PDF
    doc.save(
      `laporan-mingguan-${startDate.toISOString().split("T")[0]}-${endDate.toISOString().split("T")[0]}.pdf`,
    );
  } catch (error) {
    console.error("Error generating PDF:", error);
    throw error; // Re-throw so the calling function can handle it
  }
}

/**
 * Exports monthly report data to PDF format
 * @param reportData The monthly report data to export
 * @param startDate The start date of the month
 * @param endDate The end date of the month
 */
export async function exportMonthlyReportToPDF(
  reportData: MonthlyReportData,
  startDate: Date,
  endDate: Date,
): Promise<void> {
  try {
    // Dynamically import jsPDF and autotable plugin to avoid SSR issues
    const jsPDFModule = await import("jspdf");
    const { jsPDF } = jsPDFModule;
    const autoTable = (await import("jspdf-autotable")).default;

    // Create a new PDF document
    const doc = new jsPDF();

    // Add title
    const title = `Laporan Bulanan - ${new Date(
      reportData.startDate,
    ).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })} s.d. ${new Date(reportData.endDate).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })}`;

    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text(title, doc.internal.pageSize.width / 2, 20, { align: "center" });
    doc.setFont("helvetica", "normal");

    // Add summary information section with better layout
    doc.setFontSize(12);
    const summaryStartX = 20;
    const summaryY = 35; // Starting Y position for summary section

    // Add a header for Ringkasan Laporan
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    const summaryHeader = "Ringkasan Laporan Bulanan";
    doc.setTextColor(0, 0, 0);
    doc.text(summaryHeader, doc.internal.pageSize.width / 2, summaryY, {
      align: "center",
    }); // Center text
    doc.setTextColor(0, 0, 0); // Reset text color
    doc.setFont("helvetica", "normal");

    doc.text(
      `Total Orders: ${reportData.totalOrders}`,
      summaryStartX,
      summaryY + 10,
    );
    doc.text(
      `Total Pendapatan: ${formatCurrency(reportData.totalRevenue)}`,
      summaryStartX,
      summaryY + 20,
    );
    doc.text(
      `Total Pengeluaran: ${formatCurrency(reportData.totalExpenses)}`,
      summaryStartX + 95,
      summaryY + 10,
    );
    doc.text(
      `Keuntungan: ${formatCurrency(reportData.totalProfit)}`,
      summaryStartX + 95,
      summaryY + 20,
    );

    // Add order status summary - positioned below summary section with adequate spacing
    const statusY = summaryY + 45; // Space below summary section

    // Add a header for Status Order
    doc.setFont("helvetica", "bold");
    const statusHeader = "Status Order";
    doc.setTextColor(0, 0, 0);
    doc.text(statusHeader, doc.internal.pageSize.width / 2, statusY, {
      align: "center",
    }); // Center text
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0, 0, 0); // Reset text color

    // Organize status in a grid layout with colored indicators
    const statusItems = [
      {
        label: "Pending",
        value: reportData.ordersByStatus.pending,
        color: [255, 165, 0],
      }, // Orange
      {
        label: "Processing",
        value: reportData.ordersByStatus.processing,
        color: [65, 105, 225],
      }, // Royal Blue
      {
        label: "Selesai",
        value: reportData.ordersByStatus.finished,
        color: [34, 139, 34],
      }, // Forest Green
      {
        label: "Dibatalkan",
        value: reportData.ordersByStatus.canceled,
        color: [220, 20, 60],
      }, // Crimson
    ];

    const itemWidth = 45; // Width for each status item (180/4)
    const statusStartX = 20; // Starting X position for status items

    for (let i = 0; i < statusItems.length; i++) {
      const item = statusItems[i];
      const itemX = statusStartX + i * itemWidth;

      // Draw colored indicator
      doc.setFillColor(item.color[0], item.color[1], item.color[2]);
      doc.rect(itemX, statusY + 8, 6, 6, "F");

      // Draw status text with colored label
      doc.setTextColor(item.color[0], item.color[1], item.color[2]);
      doc.setFont("helvetica", "bold");
      doc.text(item.label, itemX + 8, statusY + 10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(0, 0, 0); // Reset to black

      // Draw the value
      doc.text(item.value.toString(), itemX + 8, statusY + 20);
    }

    // Add top selling products table
    if (reportData.topSellingProducts.length > 0) {
      const topProductsStartY = statusY + 42; // Space below status section

      // Add header for top products with centered text
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      const topProductsHeader = "Produk Terlaris Bulan Ini:";
      doc.setTextColor(0, 0, 0);
      doc.text(
        topProductsHeader,
        doc.internal.pageSize.width / 2,
        topProductsStartY,
        { align: "center" },
      ); // Center text
      doc.setFont("helvetica", "normal");
      doc.setTextColor(0, 0, 0); // Reset text color

      // Prepare data for the table
      const topProductsData: string[][] = reportData.topSellingProducts.map(
        (product) => {
          const row: string[] = [
            product.name,
            product.totalSold.toString(),
            formatCurrency(product.totalRevenue),
          ];
          return row;
        },
      );

      // Add table for top products with improved styling
      autoTable(doc, {
        head: [["Nama Produk", "Jumlah Terjual", "Total Pendapatan"]],
        body: topProductsData,
        startY: topProductsStartY + 12, // Start below the header
        theme: "grid",
        headStyles: {
          fillColor: [66, 133, 244], // Google Blue
          textColor: [255, 255, 255],
          fontSize: 11,
          fontStyle: "bold",
        },
        bodyStyles: {
          fontSize: 10,
          cellPadding: 5,
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245],
        },
        tableWidth: "wrap",
        columnStyles: {
          0: { cellWidth: "auto", overflow: "linebreak" }, // Product name column - auto adjust with line break
          1: { cellWidth: "auto", halign: "center" }, // Quantity column - auto adjust
          2: { cellWidth: "auto", halign: "right" }, // Amount column - auto adjust
        },
      });
    }

    // Add orders table if there are orders
    if (reportData.orders.length > 0) {
      // Calculate Y position based on previous elements or last auto table
      let ordersStartY = 150; // Default position if no previous elements
      if (reportData.topSellingProducts.length > 0) {
        // Position after top products table
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if ((doc as any).lastAutoTable) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ordersStartY = (doc as any).lastAutoTable.finalY + 15; // Space below previous table
        }
      } else {
        // Position after status section if no top products
        ordersStartY = statusY + 42 + 15; // Space below status section
      }

      // Add header for orders with centered text
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      const ordersHeader = "Rincian Pendapatan Bulan Ini:";
      doc.setTextColor(0, 0, 0);
      doc.text(ordersHeader, doc.internal.pageSize.width / 2, ordersStartY, {
        align: "center",
      }); // Center text
      doc.setFont("helvetica", "normal");
      doc.setTextColor(0, 0, 0); // Reset text color

      // Prepare data for the table
      const ordersData: string[][] = reportData.orders.map((order) => {
        const row: string[] = [
          new Date(order.createdAt).toLocaleDateString("id-ID"),
          order.orderNumber,
          order.user?.name || "N/A",
          order.status,
          formatCurrency(order.totalAmount),
        ];
        return row;
      });

      // Add table for orders with improved styling
      autoTable(doc, {
        head: [["Waktu", "No. Order", "Pelanggan", "Status", "Total"]],
        body: ordersData,
        startY: ordersStartY + 12, // Start below the header
        theme: "grid",
        headStyles: {
          fillColor: [66, 133, 244], // Google Blue
          textColor: [255, 255, 255],
          fontSize: 11,
          fontStyle: "bold",
        },
        bodyStyles: {
          fontSize: 10,
          cellPadding: 5,
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245],
        },
        tableWidth: "wrap",
        columnStyles: {
          0: { cellWidth: "auto" }, // Date column - auto adjust
          1: { cellWidth: "auto" }, // Order number column - auto adjust
          2: { cellWidth: "auto", overflow: "linebreak" }, // Customer name column - auto adjust with line break
          3: { cellWidth: "auto", halign: "center" }, // Status column - auto adjust
          4: { cellWidth: "auto", halign: "right" }, // Amount column - auto adjust
        },
      });
    }

    // Add expenses table if there are expenses
    if (reportData.expenses.length > 0) {
      // Calculate Y position based on previous elements or last auto table
      let expensesStartY = 150; // Default position if no previous elements
      if (reportData.orders.length > 0) {
        // Position after orders table
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if ((doc as any).lastAutoTable) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          expensesStartY = (doc as any).lastAutoTable.finalY + 15; // Space below previous table
        }
      } else if (reportData.topSellingProducts.length > 0) {
        // Position after top products table if no orders
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if ((doc as any).lastAutoTable) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          expensesStartY = (doc as any).lastAutoTable.finalY + 15; // Space below previous table
        }
      } else {
        // Position after status section if no other elements
        expensesStartY = statusY + 42 + 15; // Space below status section
      }

      // Add header for expenses with centered text
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      const expensesHeader = "Rincian Pengeluaran Bulan Ini:";
      doc.setTextColor(0, 0, 0);
      doc.text(
        expensesHeader,
        doc.internal.pageSize.width / 2,
        expensesStartY,
        { align: "center" },
      ); // Center text
      doc.setFont("helvetica", "normal");
      doc.setTextColor(0, 0, 0); // Reset text color

      // Prepare data for the table
      const expensesData: string[][] = reportData.expenses.map((expense) => {
        const row: string[] = [
          new Date(expense.date).toLocaleDateString("id-ID"),
          expense.category
            ? expense.category.charAt(0).toUpperCase() +
              expense.category.slice(1)
            : "N/A",
          expense.description || "-",
          formatCurrency(expense.nominal),
        ];
        return row;
      });

      // Add table for expenses with improved styling
      autoTable(doc, {
        head: [["Waktu", "Kategori", "Deskripsi", "Nominal"]],
        body: expensesData,
        startY: expensesStartY + 12, // Start below the header
        theme: "grid",
        headStyles: {
          fillColor: [219, 68, 55], // Google Red
          textColor: [255, 255, 255],
          fontSize: 11,
          fontStyle: "bold",
        },
        bodyStyles: {
          fontSize: 10,
          cellPadding: 5,
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245],
        },
        tableWidth: "wrap",
        columnStyles: {
          0: { cellWidth: "auto" }, // Date column - auto adjust
          1: { cellWidth: "auto" }, // Category column - auto adjust
          2: { cellWidth: 50, overflow: "linebreak" }, // Description column - limited width with line break
          3: { cellWidth: "auto", halign: "right" }, // Amount column - auto adjust
        },
      });
    }

    // Add footer
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.text(
        `Halaman ${i} dari ${pageCount}`,
        doc.internal.pageSize.width / 2,
        doc.internal.pageSize.height - 10,
        { align: "center" },
      );
    }

    // Save the PDF
    doc.save(
      `laporan-bulanan-${startDate.toISOString().split("T")[0]}-${endDate.toISOString().split("T")[0]}.pdf`,
    );
  } catch (error) {
    console.error("Error generating PDF:", error);
    throw error; // Re-throw so the calling function can handle it
  }
}

/**
 * Exports annual report data to PDF format
 * @param reportData The annual report data to export
 * @param year The year of the report
 */
export async function exportAnnualReportToPDF(
  reportData: AnnualReportData,
  year: number,
): Promise<void> {
  try {
    // Dynamically import jsPDF and autotable plugin to avoid SSR issues
    const jsPDFModule = await import("jspdf");
    const { jsPDF } = jsPDFModule;
    const autoTable = (await import("jspdf-autotable")).default;

    // Create a new PDF document
    const doc = new jsPDF();

    // Add title
    const title = `Laporan Tahunan - Tahun ${reportData.year}`;

    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text(title, doc.internal.pageSize.width / 2, 20, { align: "center" });
    doc.setFont("helvetica", "normal");

    // Add summary information section with better layout
    doc.setFontSize(12);
    const summaryStartX = 20;
    const summaryY = 35; // Starting Y position for summary section

    // Add a header for Ringkasan Laporan
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    const summaryHeader = "Ringkasan Laporan Tahunan";
    doc.setTextColor(0, 0, 0);
    doc.text(summaryHeader, doc.internal.pageSize.width / 2, summaryY, {
      align: "center",
    }); // Center text
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0, 0, 0); // Reset text color

    doc.text(
      `Total Orders: ${reportData.totalOrders}`,
      summaryStartX,
      summaryY + 10,
    );
    doc.text(
      `Total Pendapatan: ${formatCurrency(reportData.totalRevenue)}`,
      summaryStartX,
      summaryY + 20,
    );
    doc.text(
      `Total Pengeluaran: ${formatCurrency(reportData.totalExpenses)}`,
      summaryStartX + 95,
      summaryY + 10,
    );
    doc.text(
      `Keuntungan: ${formatCurrency(reportData.totalProfit)}`,
      summaryStartX + 95,
      summaryY + 20,
    );

    // Add order status summary - positioned below summary section with adequate spacing
    const statusY = summaryY + 45; // Space below summary section

    // Add a header for Status Order
    doc.setFont("helvetica", "bold");
    const statusHeader = "Status Order";
    doc.setTextColor(0, 0, 0);
    doc.text(statusHeader, doc.internal.pageSize.width / 2, statusY, {
      align: "center",
    }); // Center text
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0, 0, 0); // Reset text color

    // Organize status in a grid layout with colored indicators
    const statusItems = [
      {
        label: "Pending",
        value: reportData.ordersByStatus.pending,
        color: [255, 165, 0],
      }, // Orange
      {
        label: "Processing",
        value: reportData.ordersByStatus.processing,
        color: [65, 105, 225],
      }, // Royal Blue
      {
        label: "Selesai",
        value: reportData.ordersByStatus.finished,
        color: [34, 139, 34],
      }, // Forest Green
      {
        label: "Dibatalkan",
        value: reportData.ordersByStatus.canceled,
        color: [220, 20, 60],
      }, // Crimson
    ];

    const itemWidth = 45; // Width for each status item (180/4)
    const statusStartX = 20; // Starting X position for status items

    for (let i = 0; i < statusItems.length; i++) {
      const item = statusItems[i];
      const itemX = statusStartX + i * itemWidth;

      // Draw colored indicator
      doc.setFillColor(item.color[0], item.color[1], item.color[2]);
      doc.rect(itemX, statusY + 8, 6, 6, "F");

      // Draw status text with colored label
      doc.setTextColor(item.color[0], item.color[1], item.color[2]);
      doc.setFont("helvetica", "bold");
      doc.text(item.label, itemX + 8, statusY + 10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(0, 0, 0); // Reset to black

      // Draw the value
      doc.text(item.value.toString(), itemX + 8, statusY + 20);
    }

    // Add top selling products table
    if (reportData.topSellingProducts.length > 0) {
      const topProductsStartY = statusY + 42; // Space below status section

      // Add header for top products with centered text
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      const topProductsHeader = "Produk Terlaris Tahun Ini:";
      doc.setTextColor(0, 0, 0);
      doc.text(
        topProductsHeader,
        doc.internal.pageSize.width / 2,
        topProductsStartY,
        { align: "center" },
      ); // Center text
      doc.setFont("helvetica", "normal");
      doc.setTextColor(0, 0, 0); // Reset text color

      // Prepare data for the table
      const topProductsData: string[][] = reportData.topSellingProducts.map(
        (product) => {
          const row: string[] = [
            product.name,
            product.totalSold.toString(),
            formatCurrency(product.totalRevenue),
          ];
          return row;
        },
      );

      // Add table for top products with improved styling
      autoTable(doc, {
        head: [["Nama Produk", "Jumlah Terjual", "Total Pendapatan"]],
        body: topProductsData,
        startY: topProductsStartY + 12, // Start below the header
        theme: "grid",
        headStyles: {
          fillColor: [66, 133, 244], // Google Blue
          textColor: [255, 255, 255],
          fontSize: 11,
          fontStyle: "bold",
        },
        bodyStyles: {
          fontSize: 10,
          cellPadding: 5,
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245],
        },
        tableWidth: "wrap",
        columnStyles: {
          0: { cellWidth: "auto", overflow: "linebreak" }, // Product name column - auto adjust with line break
          1: { cellWidth: "auto", halign: "center" }, // Quantity column - auto adjust
          2: { cellWidth: "auto", halign: "right" }, // Amount column - auto adjust
        },
      });
    }

    // Add orders table if there are orders
    if (reportData.orders.length > 0) {
      // Calculate Y position based on previous elements or last auto table
      let ordersStartY = 150; // Default position if no previous elements
      if (reportData.topSellingProducts.length > 0) {
        // Position after top products table
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if ((doc as any).lastAutoTable) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ordersStartY = (doc as any).lastAutoTable.finalY + 15; // Space below previous table
        }
      } else {
        // Position after status section if no top products
        ordersStartY = statusY + 42 + 15; // Space below status section
      }

      // Add header for orders with centered text
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      const ordersHeader = "Rincian Pendapatan Tahun Ini:";
      doc.setTextColor(0, 0, 0);
      doc.text(ordersHeader, doc.internal.pageSize.width / 2, ordersStartY, {
        align: "center",
      }); // Center text
      doc.setFont("helvetica", "normal");
      doc.setTextColor(0, 0, 0); // Reset text color

      // Prepare data for the table
      const ordersData: string[][] = reportData.orders.map((order) => {
        const row: string[] = [
          new Date(order.createdAt).toLocaleDateString("id-ID"),
          order.orderNumber,
          order.user?.name || "N/A",
          order.status,
          formatCurrency(order.totalAmount),
        ];
        return row;
      });

      // Add table for orders with improved styling
      autoTable(doc, {
        head: [["Waktu", "No. Order", "Pelanggan", "Status", "Total"]],
        body: ordersData,
        startY: ordersStartY + 12, // Start below the header
        theme: "grid",
        headStyles: {
          fillColor: [66, 133, 244], // Google Blue
          textColor: [255, 255, 255],
          fontSize: 11,
          fontStyle: "bold",
        },
        bodyStyles: {
          fontSize: 10,
          cellPadding: 5,
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245],
        },
        tableWidth: "wrap",
        columnStyles: {
          0: { cellWidth: "auto" }, // Date column - auto adjust
          1: { cellWidth: "auto" }, // Order number column - auto adjust
          2: { cellWidth: "auto", overflow: "linebreak" }, // Customer name column - auto adjust with line break
          3: { cellWidth: "auto", halign: "center" }, // Status column - auto adjust
          4: { cellWidth: "auto", halign: "right" }, // Amount column - auto adjust
        },
      });
    }

    // Add expenses table if there are expenses
    if (reportData.expenses.length > 0) {
      // Calculate Y position based on previous elements or last auto table
      let expensesStartY = 150; // Default position if no previous elements
      if (reportData.orders.length > 0) {
        // Position after orders table
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if ((doc as any).lastAutoTable) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          expensesStartY = (doc as any).lastAutoTable.finalY + 15; // Space below previous table
        }
      } else if (reportData.topSellingProducts.length > 0) {
        // Position after top products table if no orders
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if ((doc as any).lastAutoTable) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          expensesStartY = (doc as any).lastAutoTable.finalY + 15; // Space below previous table
        }
      } else {
        // Position after status section if no other elements
        expensesStartY = statusY + 42 + 15; // Space below status section
      }

      // Add header for expenses with centered text
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      const expensesHeader = "Rincian Pengeluaran Tahun Ini:";
      doc.setTextColor(0, 0, 0);
      doc.text(
        expensesHeader,
        doc.internal.pageSize.width / 2,
        expensesStartY,
        { align: "center" },
      ); // Center text
      doc.setFont("helvetica", "normal");
      doc.setTextColor(0, 0, 0); // Reset text color

      // Prepare data for the table
      const expensesData: string[][] = reportData.expenses.map((expense) => {
        const row: string[] = [
          new Date(expense.date).toLocaleDateString("id-ID"),
          expense.category
            ? expense.category.charAt(0).toUpperCase() +
              expense.category.slice(1)
            : "N/A",
          expense.description || "-",
          formatCurrency(expense.nominal),
        ];
        return row;
      });

      // Add table for expenses with improved styling
      autoTable(doc, {
        head: [["Waktu", "Kategori", "Deskripsi", "Nominal"]],
        body: expensesData,
        startY: expensesStartY + 12, // Start below the header
        theme: "grid",
        headStyles: {
          fillColor: [219, 68, 55], // Google Red
          textColor: [255, 255, 255],
          fontSize: 11,
          fontStyle: "bold",
        },
        bodyStyles: {
          fontSize: 10,
          cellPadding: 5,
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245],
        },
        tableWidth: "wrap",
        columnStyles: {
          0: { cellWidth: "auto" }, // Date column - auto adjust
          1: { cellWidth: "auto" }, // Category column - auto adjust
          2: { cellWidth: 50, overflow: "linebreak" }, // Description column - limited width with line break
          3: { cellWidth: "auto", halign: "right" }, // Amount column - auto adjust
        },
      });
    }

    // Add footer
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.text(
        `Halaman ${i} dari ${pageCount}`,
        doc.internal.pageSize.width / 2,
        doc.internal.pageSize.height - 10,
        { align: "center" },
      );
    }

    // Save the PDF
    doc.save(`laporan-tahunan-${year}.pdf`);
  } catch (error) {
    console.error("Error generating PDF:", error);
    throw error; // Re-throw so the calling function can handle it
  }
}

/**
 * Exports customer report data to PDF format
 * @param reportData The customer report data to export
 * @param startDate The start date of the report
 * @param endDate The end date of the report
 */
export async function exportCustomerReportToPDF(
  reportData: CustomerReportData,
  startDate: Date,
  endDate: Date,
): Promise<void> {
  try {
    // Dynamically import jsPDF and autotable plugin to avoid SSR issues
    const jsPDFModule = await import("jspdf");
    const { jsPDF } = jsPDFModule;
    const autoTable = (await import("jspdf-autotable")).default;

    // Create a new PDF document
    const doc = new jsPDF();

    // Add title
    const title = `Laporan Pelanggan - ${new Date(
      reportData.startDate,
    ).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })} s.d. ${new Date(reportData.endDate).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })}`;

    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text(title, doc.internal.pageSize.width / 2, 20, { align: "center" });
    doc.setFont("helvetica", "normal");

    // Add summary information section with better layout
    doc.setFontSize(12);
    const summaryStartX = 20;
    const summaryY = 35; // Starting Y position for summary section

    // Add a header for Ringkasan Laporan
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    const summaryHeader = "Ringkasan Laporan Pelanggan";
    doc.setTextColor(0, 0, 0);
    doc.text(summaryHeader, doc.internal.pageSize.width / 2, summaryY, {
      align: "center",
    }); // Center text
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0, 0, 0); // Reset text color

    doc.text(
      `Total Pelanggan: ${reportData.totalCustomers}`,
      summaryStartX,
      summaryY + 10,
    );
    doc.text(
      `Total Orders: ${reportData.totalOrders}`,
      summaryStartX,
      summaryY + 20,
    );
    doc.text(
      `Total Pendapatan: ${formatCurrency(reportData.totalRevenue)}`,
      summaryStartX + 95,
      summaryY + 10,
    );
    doc.text(
      `Rata-rata Nilai Pesanan: ${formatCurrency(reportData.averageOrderValue)}`,
      summaryStartX + 95,
      summaryY + 20,
    );

    // Add order status summary - positioned below summary section with adequate spacing
    const statusY = summaryY + 45; // Space below summary section

    // Add a header for Status Order
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    const statusHeader = "Status Order";
    doc.setTextColor(0, 0, 0);
    doc.text(statusHeader, doc.internal.pageSize.width / 2, statusY, {
      align: "center",
    }); // Center text
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0, 0, 0); // Reset text color

    // Calculate order status counts from customerOrders array
    const ordersByStatus = {
      pending: reportData.customerOrders.filter(order => order.status === 'pending').length,
      processing: reportData.customerOrders.filter(order => order.status === 'processing').length,
      finished: reportData.customerOrders.filter(order => order.status === 'finished').length,
      canceled: reportData.customerOrders.filter(order => order.status === 'canceled').length,
    };
    
    // Organize status in a grid layout with colored indicators
    const statusItems = [
      {
        label: "Pending",
        value: ordersByStatus.pending,
        color: [255, 165, 0],
      }, // Orange
      {
        label: "Processing",
        value: ordersByStatus.processing,
        color: [65, 105, 225],
      }, // Royal Blue
      {
        label: "Selesai",
        value: ordersByStatus.finished,
        color: [34, 139, 34],
      }, // Forest Green
      {
        label: "Dibatalkan",
        value: ordersByStatus.canceled,
        color: [220, 20, 60],
      }, // Crimson
    ];

    const itemWidth = 45; // Width for each status item (180/4)
    const statusStartX = 20; // Starting X position for status items

    for (let i = 0; i < statusItems.length; i++) {
      const item = statusItems[i];
      const itemX = statusStartX + i * itemWidth;

      // Draw colored indicator
      doc.setFillColor(item.color[0], item.color[1], item.color[2]);
      doc.rect(itemX, statusY + 8, 6, 6, "F");

      // Draw status text with colored label
      doc.setTextColor(item.color[0], item.color[1], item.color[2]);
      doc.setFont("helvetica", "bold");
      doc.text(item.label, itemX + 8, statusY + 10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(0, 0, 0); // Reset to black

      // Draw the value
      doc.text(item.value.toString(), itemX + 8, statusY + 20);
    }

    // Add top customers table
    if (reportData.topCustomers.length > 0) {
      const topCustomersStartY = statusY + 42; // Space below status section

      // Add header for top customers with centered text
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      const topCustomersHeader = "Pelanggan Terbaik:";
      doc.setTextColor(0, 0, 0);
      doc.text(
        topCustomersHeader,
        doc.internal.pageSize.width / 2,
        topCustomersStartY,
        { align: "center" },
      ); // Center text
      doc.setFont("helvetica", "normal");
      doc.setTextColor(0, 0, 0); // Reset text color

      // Prepare data for the table
      const topCustomersData: string[][] = reportData.topCustomers.map(
        (customer) => {
          const row: string[] = [
            customer.name,
            customer.phone,
            customer.totalOrders.toString(),
            formatCurrency(customer.totalSpent),
            formatCurrency(customer.averageOrderValue),
          ];
          return row;
        },
      );

      // Add table for top customers with improved styling
      autoTable(doc, {
        head: [
          [
            "Nama Pelanggan",
            "No. Telepon",
            "Total Orders",
            "Total Pengeluaran",
            "Rata-rata Nilai Pesanan",
          ],
        ],
        body: topCustomersData,
        startY: topCustomersStartY + 10, // Start below the header (reduced spacing)
        theme: "grid",
        headStyles: {
          fillColor: [66, 133, 244], // Google Blue
          textColor: [255, 255, 255],
          fontSize: 11,
          fontStyle: "bold",
        },
        bodyStyles: {
          fontSize: 10,
          cellPadding: 5,
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245],
        },
        tableWidth: "auto", // Use auto table width that fits within page
        columnStyles: {
          0: { cellWidth: "auto", overflow: "linebreak" }, // Customer name column - fixed width with line break
          1: { cellWidth: "auto" }, // Phone column - fixed width
          2: { cellWidth: "auto", halign: "center" }, // Total orders column - fixed width
          3: { cellWidth: "auto", halign: "right" }, // Total spent column - fixed width
          4: { cellWidth: "auto", halign: "right" }, // Average order value column - fixed width
        },
        // Add page break options for better handling of long tables
        margin: { top: 5, right: 10, left: 10 }, // Add horizontal margins
        styles: {
          cellPadding: 3,
          fontSize: 9, // Smaller font size for better fit
        },
        headStyles: {
          fillColor: [66, 133, 244], // Google Blue
          textColor: [255, 255, 255],
          fontSize: 10, // Smaller header font
          fontStyle: "bold",
          cellPadding: 3,
        },
        bodyStyles: {
          fontSize: 9, // Smaller body font
          cellPadding: 3,
        },
        // Better page break handling
        pageBreak: 'auto',
        rowPageBreak: 'avoid',
      });
    }

    // Add customer orders table if there are orders
    if (reportData.customerOrders.length > 0) {
      // Calculate Y position based on previous elements or last auto table
      let customerOrdersStartY = 150; // Default position if no previous elements
      if (reportData.topCustomers.length > 0) {
        // Position after top customers table
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if ((doc as any).lastAutoTable) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          customerOrdersStartY = (doc as any).lastAutoTable.finalY + 15; // Space below previous table
        }
      } else {
        // Position after status section if no top customers
        customerOrdersStartY = statusY + 42 + 15; // Space below status section
      }

      // Add header for customer orders with centered text
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      const customerOrdersHeader = "Rincian Pesanan Pelanggan:";
      doc.setTextColor(0, 0, 0);
      doc.text(
        customerOrdersHeader,
        doc.internal.pageSize.width / 2,
        customerOrdersStartY,
        {
          align: "center",
        },
      ); // Center text
      doc.setFont("helvetica", "normal");
      doc.setTextColor(0, 0, 0); // Reset text color

      // Prepare data for the table
      const customerOrdersData: string[][] = reportData.customerOrders.map(
        (order) => {
          const row: string[] = [
            new Date(order.createdAt).toLocaleDateString("id-ID"),
            order.orderNumber,
            order.customerName,
            order.customerPhone,
            order.status,
            formatCurrency(order.totalAmount),
          ];
          return row;
        },
      );

      // Add table for customer orders with improved styling
      autoTable(doc, {
        head: [
          ["Waktu", "No. Order", "Pelanggan", "No. Telepon", "Status", "Total"],
        ],
        body: customerOrdersData,
        startY: customerOrdersStartY + 10, // Start below the header (reduced spacing)
        theme: "grid",
        headStyles: {
          fillColor: [66, 133, 244], // Google Blue
          textColor: [255, 255, 255],
          fontSize: 11,
          fontStyle: "bold",
        },
        bodyStyles: {
          fontSize: 10,
          cellPadding: 5,
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245],
        },
        tableWidth: "auto", // Use auto table width that fits within page
        columnStyles: {
          0: { cellWidth: "auto" }, // Date column - fixed width
          1: { cellWidth: "auto" }, // Order number column - fixed width
          2: { cellWidth: "auto", overflow: "linebreak" }, // Customer name column - fixed width with line break
          3: { cellWidth: "auto" }, // Customer phone column - fixed width
          4: { cellWidth: "auto", halign: "center" }, // Status column - fixed width
          5: { cellWidth: "auto", halign: "right" }, // Amount column - fixed width
        },
        // Add page break options for better handling of long tables
        margin: { top: 5, right: 10, left: 10 }, // Add horizontal margins
        styles: {
          cellPadding: 3,
          fontSize: 9, // Smaller font size for better fit
        },
        headStyles: {
          fillColor: [66, 133, 244], // Google Blue
          textColor: [255, 255, 255],
          fontSize: 10, // Smaller header font
          fontStyle: "bold",
          cellPadding: 3,
        },
        bodyStyles: {
          fontSize: 9, // Smaller body font
          cellPadding: 3,
        },
        // Better page break handling
        pageBreak: 'auto',
        rowPageBreak: 'avoid',
      });
    }

    // Add footer
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.text(
        `Halaman ${i} dari ${pageCount}`,
        doc.internal.pageSize.width / 2,
        doc.internal.pageSize.height - 10,
        { align: "center" },
      );
    }

    // Save the PDF
    doc.save(
      `laporan-pelanggan-${startDate.toISOString().split("T")[0]}-${endDate.toISOString().split("T")[0]}.pdf`,
    );
  } catch (error) {
    console.error("Error generating PDF:", error);
    throw error; // Re-throw so the calling function can handle it
  }
}

/**
 * Exports product report data to PDF format
 * @param reportData The product report data to export
 * @param startDate The start date of the report
 * @param endDate The end date of the report
 */
export async function exportProductReportToPDF(
  reportData: ProductReportData,
  startDate: Date,
  endDate: Date,
): Promise<void> {
  try {
    // Dynamically import jsPDF and autotable plugin to avoid SSR issues
    const jsPDFModule = await import("jspdf");
    const { jsPDF } = jsPDFModule;
    const autoTable = (await import("jspdf-autotable")).default;

    // Create a new PDF document
    const doc = new jsPDF();

    // Add title
    const title = `Laporan Produk - ${new Date(
      reportData.startDate,
    ).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })} s.d. ${new Date(reportData.endDate).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })}`;

    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text(title, doc.internal.pageSize.width / 2, 20, { align: "center" });
    doc.setFont("helvetica", "normal");

    // Add summary information section with better layout
    doc.setFontSize(12);
    const summaryStartX = 20;
    const summaryY = 35; // Starting Y position for summary section

    // Add a header for Ringkasan Laporan
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    const summaryHeader = "Ringkasan Laporan Produk";
    doc.setTextColor(0, 0, 0);
    doc.text(summaryHeader, doc.internal.pageSize.width / 2, summaryY, {
      align: "center",
    }); // Center text
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0, 0, 0); // Reset text color

    doc.text(
      `Total Produk: ${reportData.totalProducts}`,
      summaryStartX,
      summaryY + 10,
    );
    doc.text(
      `Total Terjual: ${reportData.totalSold}`,
      summaryStartX,
      summaryY + 20,
    );
    doc.text(
      `Total Pendapatan: ${formatCurrency(reportData.totalRevenue)}`,
      summaryStartX + 95,
      summaryY + 10,
    );
    doc.text(
      `Harga Rata-rata: ${formatCurrency(
        reportData.totalSold > 0
          ? reportData.totalRevenue / reportData.totalSold
          : 0,
      )}`,
      summaryStartX + 95,
      summaryY + 20,
    );

    // Add top selling products table
    if (reportData.topSellingProducts.length > 0) {
      const topProductsStartY = summaryY + 42; // Space below summary section

      // Add header for top products with centered text
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      const topProductsHeader = "Produk Terlaris:";
      doc.setTextColor(0, 0, 0);
      doc.text(
        topProductsHeader,
        doc.internal.pageSize.width / 2,
        topProductsStartY,
        { align: "center" },
      ); // Center text
      doc.setFont("helvetica", "normal");
      doc.setTextColor(0, 0, 0); // Reset text color

      // Prepare data for the table
      const topProductsData: string[][] = reportData.topSellingProducts.map(
        (product) => {
          const row: string[] = [
            product.name,
            product.baseCode,
            product.category,
            product.totalSold.toString(),
            formatCurrency(product.totalRevenue),
            formatCurrency(
              product.totalSold > 0
                ? product.totalRevenue / product.totalSold
                : 0,
            ),
          ];
          return row;
        },
      );

      // Add table for top products with improved styling
      autoTable(doc, {
        head: [
          [
            "Nama Produk",
            "Kode Dasar",
            "Kategori",
            "Jumlah Terjual",
            "Total Pendapatan",
            "Harga Rata-rata",
          ],
        ],
        body: topProductsData,
        startY: topProductsStartY + 10, // Start below the header (reduced spacing)
        theme: "grid",
        headStyles: {
          fillColor: [66, 133, 244], // Google Blue
          textColor: [255, 255, 255],
          fontSize: 11,
          fontStyle: "bold",
        },
        bodyStyles: {
          fontSize: 10,
          cellPadding: 5,
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245],
        },
        tableWidth: "auto", // Use auto table width that fits within page
        columnStyles: {
          0: { cellWidth: "auto", overflow: "linebreak" }, // Product name column - fixed width with line break
          1: { cellWidth: "auto" }, // Base code column - fixed width
          2: { cellWidth: "auto" }, // Category column - fixed width
          3: { cellWidth: "auto", halign: "center" }, // Quantity column - fixed width
          4: { cellWidth: "auto", halign: "right" }, // Total revenue column - fixed width
          5: { cellWidth: "auto", halign: "right" }, // Average price column - fixed width
        },
        // Add page break options for better handling of long tables
        margin: { top: 5, right: 10, left: 10 }, // Add horizontal margins
        styles: {
          cellPadding: 3,
          fontSize: 9, // Smaller font size for better fit
        },
        headStyles: {
          fillColor: [66, 133, 244], // Google Blue
          textColor: [255, 255, 255],
          fontSize: 10, // Smaller header font
          fontStyle: "bold",
          cellPadding: 3,
        },
        bodyStyles: {
          fontSize: 9, // Smaller body font
          cellPadding: 3,
        },
        // Better page break handling
        pageBreak: 'auto',
        rowPageBreak: 'avoid',
      });
    }

    // Add product sales table if there are products
    if (reportData.productSales.length > 0) {
      // Calculate Y position based on previous elements or last auto table
      let productSalesStartY = 150; // Default position if no previous elements
      if (reportData.topSellingProducts.length > 0) {
        // Position after top products table
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if ((doc as any).lastAutoTable) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          productSalesStartY = (doc as any).lastAutoTable.finalY + 15; // Space below previous table
        }
      } else {
        // Position after summary section if no top products
        productSalesStartY = summaryY + 42 + 15; // Space below summary section
      }

      // Add header for product sales with centered text
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      const productSalesHeader = "Rincian Penjualan Produk:";
      doc.setTextColor(0, 0, 0);
      doc.text(
        productSalesHeader,
        doc.internal.pageSize.width / 2,
        productSalesStartY,
        {
          align: "center",
        },
      ); // Center text
      doc.setFont("helvetica", "normal");
      doc.setTextColor(0, 0, 0); // Reset text color

      // Prepare data for the table
      const productSalesData: string[][] = reportData.productSales.map(
        (product) => {
          const row: string[] = [
            product.productName,
            product.baseCode,
            product.category,
            product.totalSold.toString(),
            formatCurrency(product.totalRevenue),
          ];
          return row;
        },
      );

      // Add table for product sales with improved styling
      autoTable(doc, {
        head: [
          [
            "Nama Produk",
            "Kode Dasar",
            "Kategori",
            "Jumlah Terjual",
            "Total Pendapatan",
          ],
        ],
        body: productSalesData,
        startY: productSalesStartY + 10, // Start below the header (reduced spacing)
        theme: "grid",
        headStyles: {
          fillColor: [66, 133, 244], // Google Blue
          textColor: [255, 255, 255],
          fontSize: 11,
          fontStyle: "bold",
        },
        bodyStyles: {
          fontSize: 10,
          cellPadding: 5,
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245],
        },
        tableWidth: "auto", // Use auto table width that fits within page
        columnStyles: {
          0: { cellWidth: "auto", overflow: "linebreak" }, // Product name column - fixed width with line break
          1: { cellWidth: "auto" }, // Base code column - fixed width
          2: { cellWidth: "auto" }, // Category column - fixed width
          3: { cellWidth: "auto", halign: "center" }, // Quantity column - fixed width
          4: { cellWidth: "auto", halign: "right" }, // Total revenue column - fixed width
        },
        // Add page break options for better handling of long tables
        margin: { top: 5, right: 10, left: 10 }, // Add horizontal margins
        styles: {
          cellPadding: 3,
          fontSize: 9, // Smaller font size for better fit
        },
        headStyles: {
          fillColor: [66, 133, 244], // Google Blue
          textColor: [255, 255, 255],
          fontSize: 10, // Smaller header font
          fontStyle: "bold",
          cellPadding: 3,
        },
        bodyStyles: {
          fontSize: 9, // Smaller body font
          cellPadding: 3,
        },
        // Better page break handling
        pageBreak: 'auto',
        rowPageBreak: 'avoid',
      });
    }

    // Add footer
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.text(
        `Halaman ${i} dari ${pageCount}`,
        doc.internal.pageSize.width / 2,
        doc.internal.pageSize.height - 10,
        { align: "center" },
      );
    }

    // Save the PDF
    doc.save(
      `laporan-produk-${startDate.toISOString().split("T")[0]}-${endDate.toISOString().split("T")[0]}.pdf`,
    );
  } catch (error) {
    console.error("Error generating PDF:", error);
    throw error; // Re-throw so the calling function can handle it
  }
}
