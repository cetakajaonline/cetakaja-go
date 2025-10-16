// Utility functions for PDF export
/* eslint-disable @typescript-eslint/no-explicit-any */
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
  Order,
  Setting,
} from "$lib/types";

import { formatCurrency, formatNumber, capitalizeFirstLetter } from "./formatters";

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

    // Create a summary table for daily report
    autoTable(doc, {
      head: [["Indikator", "Jumlah"]],
      body: [
        ["Total Orders", reportData.totalOrders.toString()],
        ["Total Pendapatan", formatCurrency(reportData.totalRevenue)],
        ["Total Pengeluaran", formatCurrency(reportData.totalExpenses)],
        ["Keuntungan", formatCurrency(reportData.totalProfit)],
      ],
      startY: summaryY + 10, // Start below the header
      theme: "grid",
      headStyles: {
        fillColor: [66, 133, 244], // Google Blue
        textColor: [255, 255, 255],
        fontSize: 11,
        fontStyle: "bold",
        halign: "center", // Center align header
      },
      bodyStyles: {
        fontSize: 10,
        cellPadding: 5,
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
      tableWidth: "auto",
      columnStyles: {
        0: { cellWidth: "auto", halign: "left" }, // Indicator column
        1: { cellWidth: "auto", halign: "right" }, // Amount column - right aligned
      },
    });

    // Add order status summary - positioned below summary section with adequate spacing
    const statusY = (doc as any).lastAutoTable
      ? (doc as any).lastAutoTable.finalY + 10
      : summaryY + 45; // Space below summary section // eslint-disable-line @typescript-eslint/no-explicit-any

    // Add a header for Status Order
    doc.setFont("helvetica", "bold");
    const statusHeader = "Status Order";
    doc.setTextColor(0, 0, 0);
    doc.text(statusHeader, doc.internal.pageSize.width / 2, statusY, {
      align: "center",
    }); // Center text
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0, 0, 0); // Reset text color

    // Create a table for order status summary
    autoTable(doc, {
      head: [["Status", "Jumlah"]],
      body: [
        ["Pending", reportData.ordersByStatus.pending.toString()],
        ["Processing", reportData.ordersByStatus.processing.toString()],
        ["Selesai", reportData.ordersByStatus.finished.toString()],
        ["Dibatalkan", reportData.ordersByStatus.canceled.toString()],
      ],
      startY: statusY + 12, // Start below the header
      theme: "grid",
      headStyles: {
        fillColor: [66, 133, 244], // Google Blue
        textColor: [255, 255, 255],
        fontSize: 11,
        fontStyle: "bold",
        halign: "center", // Center align header
      },
      bodyStyles: {
        fontSize: 10,
        cellPadding: 5,
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
      tableWidth: "auto",
      columnStyles: {
        0: { cellWidth: "auto", halign: "left" }, // Status column
        1: { cellWidth: "auto", halign: "center" }, // Count column - center aligned
      },
    });

    // Add top selling products table
    if (reportData.topSellingProducts.length > 0) {
      const topProductsStartY = (doc as any).lastAutoTable
        ? (doc as any).lastAutoTable.finalY + 10
        : statusY + 42; // Space below status section

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
        (product, index) => {
          const row: string[] = [
            (index + 1).toString(), // Add index column
            product.name,
            product.totalSold.toString(),
            formatCurrency(product.totalRevenue),
          ];
          return row;
        },
      );

      // Add table for top products with improved styling
      autoTable(doc, {
        head: [["#", "Nama Produk", "Terjual", "Total Pendapatan"]],
        body: topProductsData,
        startY: topProductsCurrentY + 12, // Start below the header using current Y position
        theme: "grid",
        headStyles: {
          fillColor: [66, 133, 244], // Google Blue
          textColor: [255, 255, 255],
          fontSize: 11,
          fontStyle: "bold",
          halign: "center", // Center align header
        },
        bodyStyles: {
          fontSize: 10,
          cellPadding: 3,
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245],
        },
        tableWidth: "wrap",
        columnStyles: {
          0: { cellWidth: 10, halign: "center" }, // Index column - fixed width, center aligned
          1: { cellWidth: 120 }, // Product name column - auto adjust
          2: { cellWidth: "auto", halign: "center" }, // Quantity column - auto adjust
          3: { cellWidth: "auto", halign: "right" }, // Amount column - auto adjust
        },
      });
    }

    // Add orders table if there are orders
    if (reportData.orders.length > 0) {
      // Calculate Y position based on previous elements or last auto table
      let ordersStartY = 150; // Default position if no previous elements
      if (reportData.topSellingProducts.length > 0) {
        // Position after top products table

        if ((doc as any).lastAutoTable) {
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

      // Calculate total revenue from orders
      const totalOrdersRevenue = reportData.orders.reduce(
        (sum, order) => sum + order.totalAmount,
        0,
      );

      // Prepare data for the table
      const ordersData: string[][] = reportData.orders.map((order, index) => {
        const row: string[] = [
          (index + 1).toString(), // Add index column
          order.createdAt
            ? new Date(order.createdAt).toLocaleDateString("id-ID")
            : "",
          order.orderNumber,
          order.user?.name || "N/A",
          capitalizeFirstLetter(order.status),
          formatCurrency(order.totalAmount),
        ];
        return row;
      });

      // Add total row to the orders table
      const finalOrdersData = [
        ...ordersData,
        ["", "", "", "", "Total", formatCurrency(totalOrdersRevenue)], // Total row with merged cells where appropriate
      ];

      // Add table for orders with improved styling
      autoTable(doc, {
        head: [["#", "Tanggal", "No. Order", "Pelanggan", "Status", "Total"]],
        body: finalOrdersData,
        startY: ordersCurrentY + 12, // Start below the header using current Y position
        theme: "grid",
        headStyles: {
          fillColor: [66, 133, 244], // Google Blue
          textColor: [255, 255, 255],
          fontSize: 11,
          fontStyle: "bold",
          halign: "center", // Center align header
        },
        bodyStyles: {
          fontSize: 10,
          cellPadding: 3,
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245],
        },
        tableWidth: "wrap",
        columnStyles: {
          0: { cellWidth: "auto", halign: "center" }, // Index column - fixed width, center aligned
          1: { cellWidth: "auto" }, // Date column - auto adjust
          2: { cellWidth: "auto" }, // Order number column - auto adjust
          3: { cellWidth: "auto", overflow: "linebreak" }, // Customer name column - auto adjust with line break
          4: { cellWidth: "auto", halign: "center" }, // Status column - auto adjust
          5: { cellWidth: 38, halign: "right" }, // Amount column - auto adjust
        },
      });
    }

    // Add expenses table if there are expenses
    if (reportData.expenses.length > 0) {
      // Calculate Y position based on previous elements or last auto table
      let expensesStartY = 150; // Default position if no previous elements
      if (reportData.orders.length > 0) {
        // Position after orders table

        if ((doc as any).lastAutoTable) {
          expensesStartY = (doc as any).lastAutoTable.finalY + 15; // Space below previous table
        }
      } else if (reportData.topSellingProducts.length > 0) {
        // Position after top products table if no orders

        if ((doc as any).lastAutoTable) {
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

      // Calculate total expenses
      const totalExpenses = reportData.expenses.reduce(
        (sum, expense) => sum + expense.nominal,
        0,
      );

      // Prepare data for the table
      const expensesData: string[][] = reportData.expenses.map(
        (expense, index) => {
          const row: string[] = [
            (index + 1).toString(), // Add index column
            expense.date
              ? new Date(expense.date).toLocaleDateString("id-ID")
              : "",
            expense.category
              ? expense.category.charAt(0).toUpperCase() +
                expense.category.slice(1)
              : "N/A",
            expense.description || "-",
            formatCurrency(expense.nominal),
          ];
          return row;
        },
      );

      // Add total row to the expenses table
      const finalExpensesData = [
        ...expensesData,
        ["", "", "", "Total", formatCurrency(totalExpenses)], // Total row with merged cells where appropriate
      ];

      // Add table for expenses with improved styling
      autoTable(doc, {
        head: [["#", "Tanggal", "Kategori", "Deskripsi", "Nominal"]],
        body: finalExpensesData,
        startY: expensesCurrentY + 12, // Start below the header using current Y position
        theme: "grid",
        headStyles: {
          fillColor: [219, 68, 55], // Google Red
          textColor: [255, 255, 255],
          fontSize: 11,
          fontStyle: "bold",
          halign: "center", // Center align header
        },
        bodyStyles: {
          fontSize: 10,
          cellPadding: 3,
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245],
        },
        tableWidth: "wrap",
        columnStyles: {
          0: { cellWidth: 10, halign: "center" }, // Index column - fixed width, center aligned
          1: { cellWidth: "auto" }, // Date column - auto adjust
          2: { cellWidth: "auto" }, // Category column - auto adjust
          3: { cellWidth: 95, overflow: "linebreak" }, // Description column - limited width with line break
          4: { cellWidth: 30, halign: "right" }, // Amount column - auto adjust
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

    // Create a summary table for weekly report
    autoTable(doc, {
      head: [["Indikator", "Jumlah"]],
      body: [
        ["Total Orders", reportData.totalOrders.toString()],
        ["Total Pendapatan", formatCurrency(reportData.totalRevenue)],
        ["Total Pengeluaran", formatCurrency(reportData.totalExpenses)],
        ["Keuntungan", formatCurrency(reportData.totalProfit)],
      ],
      startY: summaryY + 10, // Start below the header
      theme: "grid",
      headStyles: {
        fillColor: [66, 133, 244], // Google Blue
        textColor: [255, 255, 255],
        fontSize: 11,
        fontStyle: "bold",
        halign: "center", // Center align header
      },
      bodyStyles: {
        fontSize: 10,
        cellPadding: 5,
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
      tableWidth: "auto",
      columnStyles: {
        0: { cellWidth: "auto", halign: "left" }, // Indicator column
        1: { cellWidth: "auto", halign: "right" }, // Amount column - right aligned
      },
    });

    // Add order status summary - positioned below summary section with adequate spacing
    const statusY = (doc as any).lastAutoTable
      ? (doc as any).lastAutoTable.finalY + 10
      : summaryY + 45; // Space below summary section

    // Add a header for Status Order
    doc.setFont("helvetica", "bold");
    const statusHeader = "Status Order";
    doc.setTextColor(0, 0, 0);
    doc.text(statusHeader, doc.internal.pageSize.width / 2, statusY, {
      align: "center",
    }); // Center text
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0, 0, 0); // Reset text color

    // Create a table for order status summary
    autoTable(doc, {
      head: [["Status", "Jumlah"]],
      body: [
        ["Pending", reportData.ordersByStatus.pending.toString()],
        ["Processing", reportData.ordersByStatus.processing.toString()],
        ["Selesai", reportData.ordersByStatus.finished.toString()],
        ["Dibatalkan", reportData.ordersByStatus.canceled.toString()],
      ],
      startY: statusY + 12, // Start below the header
      theme: "grid",
      headStyles: {
        fillColor: [66, 133, 244], // Google Blue
        textColor: [255, 255, 255],
        fontSize: 11,
        fontStyle: "bold",
        halign: "center", // Center align header
      },
      bodyStyles: {
        fontSize: 10,
        cellPadding: 5,
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
      tableWidth: "auto",
      columnStyles: {
        0: { cellWidth: "auto", halign: "left" }, // Status column
        1: { cellWidth: "auto", halign: "center" }, // Count column - center aligned
      },
    });

    // Add top selling products table
    if (reportData.topSellingProducts.length > 0) {
      const topProductsStartY = (doc as any).lastAutoTable
        ? (doc as any).lastAutoTable.finalY + 10
        : statusY + 42; // Space below status section

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
        (product, index) => {
          const row: string[] = [
            (index + 1).toString(), // Add index column
            product.name,
            product.totalSold.toString(),
            formatCurrency(product.totalRevenue),
          ];
          return row;
        },
      );

      // Add table for top products with improved styling
      autoTable(doc, {
        head: [["#", "Nama Produk", "Terjual", "Total Pendapatan"]],
        body: topProductsData,
        startY: topProductsCurrentY + 12, // Start below the header using current Y position
        theme: "grid",
        headStyles: {
          fillColor: [66, 133, 244], // Google Blue
          textColor: [255, 255, 255],
          fontSize: 11,
          fontStyle: "bold",
          halign: "center", // Center align header
        },
        bodyStyles: {
          fontSize: 10,
          cellPadding: 3,
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245],
        },
        tableWidth: "wrap",
        columnStyles: {
          0: { cellWidth: 10, halign: "center" }, // Index column - fixed width, center aligned
          1: { cellWidth: 120 }, // Product name column - auto adjust
          2: { cellWidth: "auto", halign: "center" }, // Quantity column - auto adjust
          3: { cellWidth: 38, halign: "right" }, // Amount column - auto adjust
        },
      });
    }

    // Add orders table if there are orders
    if (reportData.orders.length > 0) {
      // Calculate Y position based on previous elements or last auto table
      let ordersStartY = 150; // Default position if no previous elements
      if (reportData.topSellingProducts.length > 0) {
        // Position after top products table

        if ((doc as any).lastAutoTable) {
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

      // Calculate total revenue from orders
      const totalOrdersRevenue = reportData.orders.reduce(
        (sum, order) => sum + order.totalAmount,
        0,
      );

      // Prepare data for the table
      const ordersData: string[][] = reportData.orders.map((order, index) => {
        const row: string[] = [
          (index + 1).toString(), // Add index column
          order.createdAt
            ? new Date(order.createdAt).toLocaleDateString("id-ID")
            : "",
          order.orderNumber,
          order.user?.name || "N/A",
          capitalizeFirstLetter(order.status),
          formatCurrency(order.totalAmount),
        ];
        return row;
      });

      // Add total row to the orders table
      const finalOrdersData = [
        ...ordersData,
        ["", "", "", "", "Total", formatCurrency(totalOrdersRevenue)], // Total row with merged cells where appropriate
      ];

      // Add table for orders with improved styling
      autoTable(doc, {
        head: [["#", "Tanggal", "No. Order", "Pelanggan", "Status", "Total"]],
        body: finalOrdersData,
        startY: ordersCurrentY + 12, // Start below the header using current Y position
        theme: "grid",
        headStyles: {
          fillColor: [66, 133, 244], // Google Blue
          textColor: [255, 255, 255],
          fontSize: 11,
          fontStyle: "bold",
          halign: "center", // Center align header
        },
        bodyStyles: {
          fontSize: 10,
          cellPadding: 3,
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245],
        },
        tableWidth: "wrap",
        columnStyles: {
          0: { cellWidth: 10, halign: "center" }, // Index column - fixed width, center aligned
          1: { cellWidth: "auto" }, // Date column - auto adjust
          2: { cellWidth: "auto" }, // Order number column - auto adjust
          3: { cellWidth: "auto", overflow: "linebreak" }, // Customer name column - auto adjust with line break
          4: { cellWidth: "auto", halign: "center" }, // Status column - auto adjust
          5: { cellWidth: 40, halign: "right" }, // Amount column - auto adjust
        },
      });
    }

    // Add expenses table if there are expenses
    if (reportData.expenses.length > 0) {
      // Calculate Y position based on previous elements or last auto table
      let expensesStartY = 150; // Default position if no previous elements
      if (reportData.orders.length > 0) {
        // Position after orders table

        if ((doc as any).lastAutoTable) {
          expensesStartY = (doc as any).lastAutoTable.finalY + 15; // Space below previous table
        }
      } else if (reportData.topSellingProducts.length > 0) {
        // Position after top products table if no orders

        if ((doc as any).lastAutoTable) {
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

      // Calculate total expenses
      const totalExpenses = reportData.expenses.reduce(
        (sum, expense) => sum + expense.nominal,
        0,
      );

      // Prepare data for the table
      const expensesData: string[][] = reportData.expenses.map(
        (expense, index) => {
          const row: string[] = [
            (index + 1).toString(), // Add index column
            expense.date
              ? new Date(expense.date).toLocaleDateString("id-ID")
              : "",
            expense.category
              ? expense.category.charAt(0).toUpperCase() +
                expense.category.slice(1)
              : "N/A",
            expense.description || "-",
            formatCurrency(expense.nominal),
          ];
          return row;
        },
      );

      // Add total row to the expenses table
      const finalExpensesData = [
        ...expensesData,
        ["", "", "", "Total", formatCurrency(totalExpenses)], // Total row with merged cells where appropriate
      ];

      // Add table for expenses with improved styling
      autoTable(doc, {
        head: [["#", "Tanggal", "Kategori", "Deskripsi", "Nominal"]],
        body: finalExpensesData,
        startY: expensesCurrentY + 12, // Start below the header using current Y position
        theme: "grid",
        headStyles: {
          fillColor: [219, 68, 55], // Google Red
          textColor: [255, 255, 255],
          fontSize: 11,
          fontStyle: "bold",
          halign: "center", // Center align header
        },
        bodyStyles: {
          fontSize: 10,
          cellPadding: 3,
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245],
        },
        tableWidth: "wrap",
        columnStyles: {
          0: { cellWidth: 10, halign: "center" }, // Index column - fixed width, center aligned
          1: { cellWidth: "auto" }, // Date column - auto adjust
          2: { cellWidth: "auto" }, // Category column - auto adjust
          3: { cellWidth: 91, overflow: "linebreak" }, // Description column - limited width with line break
          4: { cellWidth: 35, halign: "right" }, // Amount column - auto adjust
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

    // Create a summary table for monthly report
    autoTable(doc, {
      head: [["Indikator", "Jumlah"]],
      body: [
        ["Total Orders", reportData.totalOrders.toString()],
        ["Total Pendapatan", formatCurrency(reportData.totalRevenue)],
        ["Total Pengeluaran", formatCurrency(reportData.totalExpenses)],
        ["Keuntungan", formatCurrency(reportData.totalProfit)],
      ],
      startY: summaryY + 10, // Start below the header
      theme: "grid",
      headStyles: {
        fillColor: [66, 133, 244], // Google Blue
        textColor: [255, 255, 255],
        fontSize: 11,
        fontStyle: "bold",
        halign: "center", // Center align header
      },
      bodyStyles: {
        fontSize: 10,
        cellPadding: 5,
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
      tableWidth: "auto",
      columnStyles: {
        0: { cellWidth: "auto", halign: "left" }, // Indicator column
        1: { cellWidth: "auto", halign: "right" }, // Amount column - right aligned
      },
    });

    // Add order status summary - positioned below summary section with adequate spacing
    const statusY = (doc as any).lastAutoTable
      ? (doc as any).lastAutoTable.finalY + 10
      : summaryY + 45; // Space below summary section

    // Add a header for Status Order
    doc.setFont("helvetica", "bold");
    const statusHeader = "Status Order";
    doc.setTextColor(0, 0, 0);
    doc.text(statusHeader, doc.internal.pageSize.width / 2, statusY, {
      align: "center",
    }); // Center text
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0, 0, 0); // Reset text color

    // Create a table for order status summary
    autoTable(doc, {
      head: [["Status", "Jumlah"]],
      body: [
        ["Pending", reportData.ordersByStatus.pending.toString()],
        ["Processing", reportData.ordersByStatus.processing.toString()],
        ["Selesai", reportData.ordersByStatus.finished.toString()],
        ["Dibatalkan", reportData.ordersByStatus.canceled.toString()],
      ],
      startY: statusY + 12, // Start below the header
      theme: "grid",
      headStyles: {
        fillColor: [66, 133, 244], // Google Blue
        textColor: [255, 255, 255],
        fontSize: 11,
        fontStyle: "bold",
        halign: "center", // Center align header
      },
      bodyStyles: {
        fontSize: 10,
        cellPadding: 5,
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
      tableWidth: "auto",
      columnStyles: {
        0: { cellWidth: "auto", halign: "left" }, // Status column
        1: { cellWidth: "auto", halign: "center" }, // Count column - center aligned
      },
    });

    // Add top selling products table
    if (reportData.topSellingProducts.length > 0) {
      const topProductsStartY = (doc as any).lastAutoTable
        ? (doc as any).lastAutoTable.finalY + 10
        : statusY + 42; // Space below status section

      // Add header for top products with centered text
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      const topProductsHeader = "Produk Terlaris Bulan Ini";
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
        (product, index) => {
          const row: string[] = [
            (index + 1).toString(), // Add index column
            product.name,
            product.totalSold.toString(),
            formatCurrency(product.totalRevenue),
          ];
          return row;
        },
      );

      // Add table for top products with improved styling
      autoTable(doc, {
        head: [["#", "Nama Produk", "Terjual", "Total Pendapatan"]],
        body: topProductsData,
        startY: topProductsStartY + 12, // Start below the header
        theme: "grid",
        headStyles: {
          fillColor: [66, 133, 244], // Google Blue
          textColor: [255, 255, 255],
          fontSize: 11,
          fontStyle: "bold",
          halign: "center", // Center align header
        },
        bodyStyles: {
          fontSize: 10,
          cellPadding: 3,
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245],
        },
        tableWidth: "wrap",
        columnStyles: {
          0: { cellWidth: 10, halign: "center" }, // Index column - fixed width, center aligned
          1: { cellWidth: 120, overflow: "linebreak" }, // Product name column - auto adjust with line break
          2: { cellWidth: "auto", halign: "center" }, // Quantity column - auto adjust
          3: { cellWidth: "auto", halign: "right" }, // Amount column - auto adjust
        },
      });
    }

    // Add orders table if there are orders
    if (reportData.orders.length > 0) {
      // Calculate Y position based on previous elements or last auto table
      let ordersStartY = 150; // Default position if no previous elements
      if (reportData.topSellingProducts.length > 0) {
        // Position after top products table

        if ((doc as any).lastAutoTable) {
          ordersStartY = (doc as any).lastAutoTable.finalY + 15; // Space below previous table
        }
      } else {
        // Position after status section if no top products
        ordersStartY = statusY + 42 + 15; // Space below status section
      }

      // Add header for orders with centered text
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      const ordersHeader = "Rincian Pendapatan Bulan Ini";
      doc.setTextColor(0, 0, 0);
      doc.text(ordersHeader, doc.internal.pageSize.width / 2, ordersStartY, {
        align: "center",
      }); // Center text
      doc.setFont("helvetica", "normal");
      doc.setTextColor(0, 0, 0); // Reset text color

      // Calculate total revenue from orders
      const totalOrdersRevenue = reportData.orders.reduce(
        (sum, order) => sum + order.totalAmount,
        0,
      );

      // Prepare data for the table
      const ordersData: string[][] = reportData.orders.map((order, index) => {
        const row: string[] = [
          (index + 1).toString(), // Add index column
          order.createdAt
            ? new Date(order.createdAt).toLocaleDateString("id-ID")
            : "",
          order.orderNumber,
          order.user?.name || "N/A",
          capitalizeFirstLetter(order.status),
          formatCurrency(order.totalAmount),
        ];
        return row;
      });

      // Add total row to the orders table
      const finalOrdersData = [
        ...ordersData,
        ["", "", "", "", "Total", formatCurrency(totalOrdersRevenue)], // Total row with merged cells where appropriate
      ];

      // Add table for orders with improved styling
      autoTable(doc, {
        head: [["#", "Tanggal", "No. Order", "Pelanggan", "Status", "Total"]],
        body: finalOrdersData,
        startY: ordersStartY + 12, // Start below the header
        theme: "grid",
        headStyles: {
          fillColor: [66, 133, 244], // Google Blue
          textColor: [255, 255, 255],
          fontSize: 11,
          fontStyle: "bold",
          halign: "center", // Center align header
        },
        bodyStyles: {
          fontSize: 10,
          cellPadding: 3,
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245],
        },
        tableWidth: "wrap",
        columnStyles: {
          0: { cellWidth: 10, halign: "center" }, // Index column - fixed width, center aligned
          1: { cellWidth: "auto" }, // Date column - auto adjust
          2: { cellWidth: "auto" }, // Order number column - auto adjust
          3: { cellWidth: "auto", overflow: "linebreak" }, // Customer name column - auto adjust with line break
          4: { cellWidth: "auto", halign: "center" }, // Status column - auto adjust
          5: { cellWidth: 38, halign: "right" }, // Amount column - auto adjust
        },
      });
    }

    // Add expenses table if there are expenses
    if (reportData.expenses.length > 0) {
      // Calculate Y position based on previous elements or last auto table
      let expensesStartY = 150; // Default position if no previous elements
      if (reportData.orders.length > 0) {
        // Position after orders table

        if ((doc as any).lastAutoTable) {
          expensesStartY = (doc as any).lastAutoTable.finalY + 15; // Space below previous table
        }
      } else if (reportData.topSellingProducts.length > 0) {
        // Position after top products table if no orders

        if ((doc as any).lastAutoTable) {
          expensesStartY = (doc as any).lastAutoTable.finalY + 15; // Space below previous table
        }
      } else {
        // Position after status section if no other elements
        expensesStartY = statusY + 42 + 15; // Space below status section
      }

      // Add header for expenses with centered text
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      const expensesHeader = "Rincian Pengeluaran Bulan Ini";
      doc.setTextColor(0, 0, 0);
      doc.text(
        expensesHeader,
        doc.internal.pageSize.width / 2,
        expensesStartY,
        { align: "center" },
      ); // Center text
      doc.setFont("helvetica", "normal");
      doc.setTextColor(0, 0, 0); // Reset text color

      // Calculate total expenses
      const totalExpenses = reportData.expenses.reduce(
        (sum, expense) => sum + expense.nominal,
        0,
      );

      // Prepare data for the table
      const expensesData: string[][] = reportData.expenses.map(
        (expense, index) => {
          const row: string[] = [
            (index + 1).toString(), // Add index column
            expense.date
              ? new Date(expense.date).toLocaleDateString("id-ID")
              : "",
            expense.category
              ? expense.category.charAt(0).toUpperCase() +
                expense.category.slice(1)
              : "N/A",
            expense.description || "-",
            formatCurrency(expense.nominal),
          ];
          return row;
        },
      );

      // Add total row to the expenses table
      const finalExpensesData = [
        ...expensesData,
        ["", "", "", "Total", formatCurrency(totalExpenses)], // Total row with merged cells where appropriate
      ];

      // Add table for expenses with improved styling
      autoTable(doc, {
        head: [["#", "Tanggal", "Kategori", "Deskripsi", "Nominal"]],
        body: finalExpensesData,
        startY: expensesStartY + 12, // Start below the header
        theme: "grid",
        headStyles: {
          fillColor: [219, 68, 55], // Google Red
          textColor: [255, 255, 255],
          fontSize: 11,
          fontStyle: "bold",
          halign: "center", // Center align header
        },
        bodyStyles: {
          fontSize: 10,
          cellPadding: 3,
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245],
        },
        tableWidth: "wrap",
        columnStyles: {
          0: { cellWidth: 10, halign: "center" }, // Index column - fixed width, center aligned
          1: { cellWidth: "auto" }, // Date column - auto adjust
          2: { cellWidth: "auto" }, // Category column - auto adjust
          3: { cellWidth: 95, overflow: "linebreak" }, // Description column - limited width with line break
          4: { cellWidth: "auto", halign: "right" }, // Amount column - auto adjust
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

    // Create a summary table for annual report
    autoTable(doc, {
      head: [["Indikator", "Jumlah"]],
      body: [
        ["Total Orders", reportData.totalOrders.toString()],
        ["Total Pendapatan", formatCurrency(reportData.totalRevenue)],
        ["Total Pengeluaran", formatCurrency(reportData.totalExpenses)],
        ["Keuntungan", formatCurrency(reportData.totalProfit)],
      ],
      startY: summaryY + 10, // Start below the header
      theme: "grid",
      headStyles: {
        fillColor: [66, 133, 244], // Google Blue
        textColor: [255, 255, 255],
        fontSize: 11,
        fontStyle: "bold",
        halign: "center", // Center align header
      },
      bodyStyles: {
        fontSize: 10,
        cellPadding: 5,
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
      tableWidth: "auto",
      columnStyles: {
        0: { cellWidth: "auto", halign: "left" }, // Indicator column
        1: { cellWidth: "auto", halign: "right" }, // Amount column - right aligned
      },
    });

    // Add order status summary - positioned below summary section with adequate spacing
    const statusY = (doc as any).lastAutoTable
      ? (doc as any).lastAutoTable.finalY + 10
      : summaryY + 45; // Space below summary section

    // Add a header for Status Order
    doc.setFont("helvetica", "bold");
    const statusHeader = "Status Order";
    doc.setTextColor(0, 0, 0);
    doc.text(statusHeader, doc.internal.pageSize.width / 2, statusY, {
      align: "center",
    }); // Center text
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0, 0, 0); // Reset text color

    // Create a table for order status summary
    autoTable(doc, {
      head: [["Status", "Jumlah"]],
      body: [
        ["Pending", reportData.ordersByStatus.pending.toString()],
        ["Processing", reportData.ordersByStatus.processing.toString()],
        ["Selesai", reportData.ordersByStatus.finished.toString()],
        ["Dibatalkan", reportData.ordersByStatus.canceled.toString()],
      ],
      startY: statusY + 12, // Start below the header
      theme: "grid",
      headStyles: {
        fillColor: [66, 133, 244], // Google Blue
        textColor: [255, 255, 255],
        fontSize: 11,
        fontStyle: "bold",
        halign: "center", // Center align header
      },
      bodyStyles: {
        fontSize: 10,
        cellPadding: 5,
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
      tableWidth: "auto",
      columnStyles: {
        0: { cellWidth: "auto", halign: "left" }, // Status column
        1: { cellWidth: "auto", halign: "center" }, // Count column - center aligned
      },
    });

    // Add top selling products table
    if (reportData.topSellingProducts.length > 0) {
      const topProductsStartY = (doc as any).lastAutoTable
        ? (doc as any).lastAutoTable.finalY + 10
        : statusY + 42; // Space below status section

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
      const topProductsHeader = "Produk Terlaris Tahun Ini";
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
        (product, index) => {
          const row: string[] = [
            (index + 1).toString(), // Add index column
            product.name,
            product.totalSold.toString(),
            formatCurrency(product.totalRevenue),
          ];
          return row;
        },
      );

      // Add table for top products with improved styling
      autoTable(doc, {
        head: [["#", "Nama Produk", "Terjual", "Total Pendapatan"]],
        body: topProductsData,
        startY: topProductsCurrentY + 12, // Start below the header
        theme: "grid",
        headStyles: {
          fillColor: [66, 133, 244], // Google Blue
          textColor: [255, 255, 255],
          fontSize: 11,
          fontStyle: "bold",
          halign: "center", // Center align header
        },
        bodyStyles: {
          fontSize: 10,
          cellPadding: 3,
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245],
        },
        tableWidth: "wrap",
        columnStyles: {
          0: { cellWidth: 13, halign: "center" }, // Index column - fixed width, center aligned
          1: { cellWidth: 120, overflow: "linebreak" }, // Product name column - auto adjust with line break
          2: { cellWidth: "auto", halign: "center" }, // Quantity column - auto adjust
          3: { cellWidth: "auto", halign: "right" }, // Amount column - auto adjust
        },
      });
    }

    // Add orders table if there are orders
    if (reportData.orders.length > 0) {
      // Calculate Y position based on previous elements or last auto table
      let ordersStartY = 150; // Default position if no previous elements
      if (reportData.topSellingProducts.length > 0) {
        // Position after top products table

        if ((doc as any).lastAutoTable) {
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
      const ordersHeader = "Rincian Pendapatan Tahun Ini";
      doc.setTextColor(0, 0, 0);
      doc.text(ordersHeader, doc.internal.pageSize.width / 2, ordersCurrentY, {
        align: "center",
      }); // Center text
      doc.setFont("helvetica", "normal");
      doc.setTextColor(0, 0, 0); // Reset text color

      // Calculate total revenue from orders
      const totalOrdersRevenue = reportData.orders.reduce(
        (sum, order) => sum + order.totalAmount,
        0,
      );

      // Prepare data for the table
      const ordersData: string[][] = reportData.orders.map((order, index) => {
        const row: string[] = [
          (index + 1).toString(), // Add index column
          order.createdAt
            ? new Date(order.createdAt).toLocaleDateString("id-ID")
            : "",
          order.orderNumber,
          order.user?.name || "N/A",
          capitalizeFirstLetter(order.status),
          formatCurrency(order.totalAmount),
        ];
        return row;
      });

      // Add total row to the orders table
      const finalOrdersData = [
        ...ordersData,
        ["", "", "", "", "Total", formatCurrency(totalOrdersRevenue)], // Total row with merged cells where appropriate
      ];

      // Add table for orders with improved styling
      autoTable(doc, {
        head: [["#", "Tanggal", "No. Order", "Pelanggan", "Status", "Total"]],
        body: finalOrdersData,
        startY: ordersCurrentY + 12, // Start below the header
        theme: "grid",
        headStyles: {
          fillColor: [66, 133, 244], // Google Blue
          textColor: [255, 255, 255],
          fontSize: 11,
          fontStyle: "bold",
          halign: "center", // Center align header
        },
        bodyStyles: {
          fontSize: 10,
          cellPadding: 3,
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245],
        },
        tableWidth: "wrap",
        columnStyles: {
          0: { cellWidth: 10, halign: "center" }, // Index column - fixed width, center aligned
          1: { cellWidth: "auto" }, // Date column - auto adjust
          2: { cellWidth: "auto" }, // Order number column - auto adjust
          3: { cellWidth: "auto", overflow: "linebreak" }, // Customer name column - auto adjust with line break
          4: { cellWidth: "auto", halign: "center" }, // Status column - auto adjust
          5: { cellWidth: 40, halign: "right" }, // Amount column - auto adjust
        },
      });
    }

    // Add expenses table if there are expenses
    if (reportData.expenses.length > 0) {
      // Calculate Y position based on previous elements or last auto table
      let expensesStartY = 150; // Default position if no previous elements
      if (reportData.orders.length > 0) {
        // Position after orders table

        if ((doc as any).lastAutoTable) {
          expensesStartY = (doc as any).lastAutoTable.finalY + 15; // Space below previous table
        }
      } else if (reportData.topSellingProducts.length > 0) {
        // Position after top products table if no orders

        if ((doc as any).lastAutoTable) {
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
      const expensesHeader = "Rincian Pengeluaran Tahun Ini";
      doc.setTextColor(0, 0, 0);
      doc.text(
        expensesHeader,
        doc.internal.pageSize.width / 2,
        expensesCurrentY,
        { align: "center" },
      ); // Center text
      doc.setFont("helvetica", "normal");
      doc.setTextColor(0, 0, 0); // Reset text color

      // Calculate total expenses
      const totalExpenses = reportData.expenses.reduce(
        (sum, expense) => sum + expense.nominal,
        0,
      );

      // Prepare data for the table
      const expensesData: string[][] = reportData.expenses.map(
        (expense, index) => {
          const row: string[] = [
            (index + 1).toString(), // Add index column
            expense.date
              ? new Date(expense.date).toLocaleDateString("id-ID")
              : "",
            expense.category
              ? expense.category.charAt(0).toUpperCase() +
                expense.category.slice(1)
              : "N/A",
            expense.description || "-",
            formatCurrency(expense.nominal),
          ];
          return row;
        },
      );

      // Add total row to the expenses table
      const finalExpensesData = [
        ...expensesData,
        ["", "", "", "Total", formatCurrency(totalExpenses)], // Total row with merged cells where appropriate
      ];

      // Add table for expenses with improved styling
      autoTable(doc, {
        head: [["#", "Tanggal", "Kategori", "Deskripsi", "Nominal"]],
        body: finalExpensesData,
        startY: expensesCurrentY + 12, // Start below the header
        theme: "grid",
        headStyles: {
          fillColor: [219, 68, 55], // Google Red
          textColor: [255, 255, 255],
          fontSize: 11,
          fontStyle: "bold",
          halign: "center", // Center align header
        },
        bodyStyles: {
          fontSize: 10,
          cellPadding: 3,
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245],
        },
        tableWidth: "wrap",
        columnStyles: {
          0: { cellWidth: 10, halign: "center" }, // Index column - fixed width, center aligned
          1: { cellWidth: "auto" }, // Date column - auto adjust
          2: { cellWidth: "auto" }, // Category column - auto adjust
          3: { cellWidth: 95, overflow: "linebreak" }, // Description column - limited width with line break
          4: { cellWidth: "auto", halign: "right" }, // Amount column - auto adjust
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

    // Create a summary table for customer report
    autoTable(doc, {
      head: [["Indikator", "Jumlah"]],
      body: [
        ["Total Pelanggan", reportData.totalCustomers.toString()],
        ["Total Orders", reportData.totalOrders.toString()],
        ["Total Pendapatan", formatCurrency(reportData.totalRevenue)],
        [
          "Rata-rata Nilai Pesanan",
          formatCurrency(reportData.averageOrderValue),
        ],
      ],
      startY: summaryY + 10, // Start below the header
      theme: "grid",
      headStyles: {
        fillColor: [66, 133, 244], // Google Blue
        textColor: [255, 255, 255],
        fontSize: 11,
        fontStyle: "bold",
        halign: "center", // Center align header
      },
      bodyStyles: {
        fontSize: 10,
        cellPadding: 5,
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
      tableWidth: "auto",
      columnStyles: {
        0: { cellWidth: "auto", halign: "left" }, // Indicator column
        1: { cellWidth: "auto", halign: "right" }, // Amount column - right aligned
      },
    });

    // Add order status summary - positioned below summary section with adequate spacing
    const statusY = (doc as any).lastAutoTable
      ? (doc as any).lastAutoTable.finalY + 10
      : summaryY + 45; // Space below summary section

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

    // Create a table for order status summary
    autoTable(doc, {
      head: [["Status", "Jumlah"]],
      body: [
        [capitalizeFirstLetter("pending"), ordersByStatus.pending.toString()],
        [
          capitalizeFirstLetter("processing"),
          ordersByStatus.processing.toString(),
        ],
        [capitalizeFirstLetter("finished"), ordersByStatus.finished.toString()],
        [capitalizeFirstLetter("canceled"), ordersByStatus.canceled.toString()],
      ],
      startY: statusY + 12, // Start below the header
      theme: "grid",
      headStyles: {
        fillColor: [66, 133, 244], // Google Blue
        textColor: [255, 255, 255],
        fontSize: 11,
        fontStyle: "bold",
        halign: "center", // Center align header
      },
      bodyStyles: {
        fontSize: 10,
        cellPadding: 5,
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
      tableWidth: "auto",
      columnStyles: {
        0: { cellWidth: "auto", halign: "left" }, // Status column
        1: { cellWidth: "auto", halign: "center" }, // Count column - center aligned
      },
    });

    // Add top customers table
    if (reportData.topCustomers.length > 0) {
      const topCustomersStartY = (doc as any).lastAutoTable
        ? (doc as any).lastAutoTable.finalY + 10
        : statusY + 42; // Space below status section

      // Add header for top customers with centered text
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      const topCustomersHeader = "Pelanggan Terbaik";
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
          halign: "center", // Center align header
        },
        bodyStyles: {
          fontSize: 9, // Smaller body font
          cellPadding: 3,
        },
        // Better page break handling
        pageBreak: "auto",
        rowPageBreak: "avoid",
      });
    }

    // Add customer orders table if there are orders
    if (reportData.customerOrders.length > 0) {
      // Calculate Y position based on previous elements or last auto table
      let customerOrdersStartY = 150; // Default position if no previous elements
      if (reportData.topCustomers.length > 0) {
        // Position after top customers table

        if ((doc as any).lastAutoTable) {
          customerOrdersStartY = (doc as any).lastAutoTable.finalY + 15; // Space below previous table
        }
      } else {
        // Position after status section if no top customers
        customerOrdersStartY = statusY + 42 + 15; // Space below status section
      }

      // Add header for customer orders with centered text
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      const customerOrdersHeader = "Rincian Pesanan Pelanggan";
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
            order.createdAt
              ? new Date(order.createdAt).toLocaleDateString("id-ID")
              : "",
            order.orderNumber,
            order.customerName,
            order.customerPhone,
            capitalizeFirstLetter(order.status),
            formatCurrency(order.totalAmount),
          ];
          return row;
        },
      );

      // Calculate total revenue from customer orders
      const totalCustomerOrdersRevenue = reportData.customerOrders.reduce(
        (sum, order) => sum + order.totalAmount,
        0,
      );

      // Add total row to the customer orders table
      const finalCustomerOrdersData = [
        ...customerOrdersData,
        ["", "", "", "", "Total", formatCurrency(totalCustomerOrdersRevenue)], // Total row with merged cells where appropriate
      ];

      // Add table for customer orders with improved styling
      autoTable(doc, {
        head: [
          [
            "Tanggal",
            "No. Order",
            "Pelanggan",
            "No. Telepon",
            "Status",
            "Total",
          ],
        ],
        body: finalCustomerOrdersData,
        startY: customerOrdersStartY + 10, // Start below the header (reduced spacing)
        theme: "grid",
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
          halign: "center", // Center align header
        },
        bodyStyles: {
          fontSize: 9, // Smaller body font
          cellPadding: 3,
        },
        // Better page break handling
        pageBreak: "auto",
        rowPageBreak: "avoid",
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

    // Create a summary table for product report
    autoTable(doc, {
      head: [["Indikator", "Jumlah"]],
      body: [
        ["Total Produk", reportData.totalProducts.toString()],
        ["Total Terjual", reportData.totalSold.toString()],
        ["Total Pendapatan", formatCurrency(reportData.totalRevenue)],
        [
          "Harga Rata-rata",
          formatCurrency(
            reportData.totalSold > 0
              ? reportData.totalRevenue / reportData.totalSold
              : 0,
          ),
        ],
      ],
      startY: summaryY + 10, // Start below the header
      theme: "grid",
      headStyles: {
        fillColor: [66, 133, 244], // Google Blue
        textColor: [255, 255, 255],
        fontSize: 11,
        fontStyle: "bold",
        halign: "center", // Center align header
      },
      bodyStyles: {
        fontSize: 10,
        cellPadding: 5,
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
      tableWidth: "auto",
      columnStyles: {
        0: { cellWidth: "auto", halign: "left" }, // Indicator column
        1: { cellWidth: "auto", halign: "right" }, // Amount column - right aligned
      },
    });

    // Add top selling products table
    if (reportData.topSellingProducts.length > 0) {
      const topProductsStartY = (doc as any).lastAutoTable
        ? (doc as any).lastAutoTable.finalY + 10
        : summaryY + 42; // Space below summary section

      // Add header for top products with centered text
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      const topProductsHeader = "Produk Terlaris";
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
            "Kode",
            "Kategori",
            "Terjual",
            "Total Pendapatan",
            "Harga Rata-rata",
          ],
        ],
        body: topProductsData,
        startY: topProductsStartY + 10, // Start below the header (reduced spacing)
        theme: "grid",
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
          halign: "center", // Center align header
        },
        bodyStyles: {
          fontSize: 9, // Smaller body font
          cellPadding: 3,
        },
        // Better page break handling
        pageBreak: "auto",
        rowPageBreak: "avoid",
      });
    }

    // Add product sales table if there are products
    if (reportData.productSales.length > 0) {
      // Calculate Y position based on previous elements or last auto table
      let productSalesStartY = 150; // Default position if no previous elements
      if (reportData.topSellingProducts.length > 0) {
        // Position after top products table

        if ((doc as any).lastAutoTable) {
          productSalesStartY = (doc as any).lastAutoTable.finalY + 15; // Space below previous table
        }
      } else {
        // Position after summary section if no top products
        productSalesStartY = summaryY + 42 + 15; // Space below summary section
      }

      // Add header for product sales with centered text
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      const productSalesHeader = "Rincian Penjualan Produk";
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
          ["Nama Produk", "Kode", "Kategori", "Terjual", "Total Pendapatan"],
        ],
        body: productSalesData,
        startY: productSalesStartY + 10, // Start below the header (reduced spacing)
        theme: "grid",
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
          halign: "center", // Center align header
        },
        bodyStyles: {
          fontSize: 9, // Smaller body font
          cellPadding: 3,
        },
        // Better page break handling
        pageBreak: "auto",
        rowPageBreak: "avoid",
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

/**
 * Exports revenue report data to PDF format
 * @param reportData The revenue report data to export
 * @param startDate The start date of the report
 * @param endDate The end date of the report
 */
export async function exportRevenueReportToPDF(
  reportData: RevenueReportData,
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
    const title = `Laporan Pendapatan - ${new Date(
      reportData.startDate ?? new Date(),
    ).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })} s.d. ${new Date(reportData.endDate ?? new Date()).toLocaleDateString(
      "id-ID",
      {
        day: "numeric",
        month: "long",
        year: "numeric",
      },
    )}`;

    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text(title, doc.internal.pageSize.width / 2, 20, { align: "center" });
    doc.setFont("helvetica", "normal");

    // Add summary information section
    doc.setFontSize(12);
    const summaryY = 35; // Starting Y position for summary section

    // Add a header for Ringkasan Laporan
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    const summaryHeader = "Ringkasan Laporan Pendapatan";
    doc.setTextColor(0, 0, 0);
    doc.text(summaryHeader, doc.internal.pageSize.width / 2, summaryY, {
      align: "center",
    }); // Center text
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0, 0, 0); // Reset text color

    // Create a summary table for revenue report
    autoTable(doc, {
      head: [["Indikator", "Jumlah"]],
      body: [
        ["Total Pendapatan", formatCurrency(reportData.totalRevenue)],
        ["Total Pengeluaran", formatCurrency(reportData.totalExpenses)],
        ["Pendapatan Bersih", formatCurrency(reportData.netRevenue)],
        ["Total Order", reportData.totalOrders.toString()],
      ],
      startY: summaryY + 10, // Start below the header
      theme: "grid",
      headStyles: {
        fillColor: [66, 133, 244], // Google Blue
        textColor: [255, 255, 255],
        fontSize: 11,
        fontStyle: "bold",
        halign: "center", // Center align header
      },
      bodyStyles: {
        fontSize: 10,
        cellPadding: 5,
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
      tableWidth: "auto",
      columnStyles: {
        0: { cellWidth: "auto", halign: "left" }, // Indicator column
        1: { cellWidth: "auto", halign: "right" }, // Amount column - right aligned
      },
    });

    // Calculate starting Y position for the top revenue products table based on the summary table
    const topProductsStartY = (doc as any).lastAutoTable
      ? (doc as any).lastAutoTable.finalY + 10
      : summaryY + 42; // Space below summary section

    // Add header for top products with centered text
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    const topProductsHeader = "Produk Pendapatan Tertinggi";
    doc.setTextColor(0, 0, 0);
    doc.text(
      topProductsHeader,
      doc.internal.pageSize.width / 2,
      topProductsStartY,
      { align: "center" },
    ); // Center text
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0, 0, 0); // Reset text color

    // Table for top revenue products
    autoTable(doc, {
      head: [["#", "Nama Produk", "Terjual", "Total Pendapatan"]],
      body: reportData.topRevenueProducts.map(
        (
          item: { name: string; totalSold: number; totalRevenue: number },
          index: number,
        ) => [
          index + 1,
          item.name,
          item.totalSold,
          formatCurrency(item.totalRevenue),
        ],
      ),
      startY: topProductsStartY + 5, // Position after the header text
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
        halign: "center", // Center align header
      },
      bodyStyles: {
        fontSize: 9, // Smaller body font
        cellPadding: 3,
      },
      columnStyles: {
        2: { halign: "center" }, // Center align the "Terjual" column (index 2)
        3: { halign: "right" }, // Right align the "Total Pendapatan" column (index 3)
      },
      // Better page break handling
      pageBreak: "auto",
      rowPageBreak: "avoid",
    });

    // Add orders table if there are any orders
    if (reportData.orders.length > 0) {
      const ordersHeader = "Daftar Order";

      // Add header text for orders
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text(
        ordersHeader,
        doc.internal.pageSize.width / 2,
        (doc as any).lastAutoTable
          ? (doc as any).lastAutoTable.finalY + 15
          : reportData.topRevenueProducts.length > 0
            ? (doc as any).lastAutoTable
              ? (doc as any).lastAutoTable.finalY + 15
              : summaryY + 42 + 25 + 15
            : summaryY + 42 + 15,
        { align: "center" },
      );
      doc.setFont("helvetica", "normal");

      // Calculate starting Y position for the table
      let ordersStartY = (doc as any).lastAutoTable
        ? (doc as any).lastAutoTable.finalY + 20
        : reportData.topRevenueProducts.length > 0
          ? summaryY + 42 + 25 + 20
          : summaryY + 42 + 20;

      // Calculate total revenue from orders
      const totalOrdersRevenue = reportData.orders.reduce(
        (sum: number, order: { totalAmount: number }) =>
          sum + order.totalAmount,
        0,
      );

      // Prepare data for the orders table
      const ordersData: (string | number)[][] = reportData.orders.map(
        (
          order: {
            orderNumber: string;
            user: { name: string };
            status: string;
            paymentMethod: string;
            totalAmount: number;
            createdAt: Date;
          },
          index: number,
        ) => [
          index + 1,
          order.createdAt
            ? new Date(order.createdAt).toLocaleDateString("id-ID", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              })
            : "",
          order.orderNumber,
          order.user.name,
          capitalizeFirstLetter(order.status),
          capitalizeFirstLetter(order.paymentMethod),
          formatCurrency(order.totalAmount),
        ],
      );

      // Add total row to the orders table
      const finalOrdersData = [
        ...ordersData,
        ["", "", "", "", "", "Total", formatCurrency(totalOrdersRevenue)], // Total row with merged cells where appropriate
      ];

      // Table for orders
      autoTable(doc, {
        head: [
          [
            "#",
            "Tanggal",
            "No. Order",
            "Nama Kasir",
            "Status",
            "Pembayaran",
            "Jumlah",
          ],
        ],
        body: finalOrdersData,
        startY: ordersStartY,
        styles: {
          cellPadding: 3,
          fontSize: 8, // Smaller font size for better fit
        },
        headStyles: {
          fillColor: [66, 133, 244], // Google Blue
          textColor: [255, 255, 255],
          fontSize: 9, // Smaller header font
          fontStyle: "bold",
          cellPadding: 3,
          halign: "center", // Center align header
        },
        bodyStyles: {
          fontSize: 8, // Smaller body font
          cellPadding: 3,
        },
        // Better page break handling
        pageBreak: "auto",
        rowPageBreak: "avoid",
        // Column widths and alignments
        columnStyles: {
          0: { cellWidth: 10 }, // Index column
          1: { cellWidth: 30 }, // Date column - fixed width
          2: { cellWidth: 30 }, // Order number column
          3: { cellWidth: 30 }, // Cashier column - fixed width
          4: { cellWidth: 25 }, // Status column
          5: { cellWidth: 35 }, // Payment method column
          6: { cellWidth: 30, halign: "right" }, // Amount column - fixed width, right aligned
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
      `laporan-pendapatan-${startDate.toISOString().split("T")[0]}-${endDate.toISOString().split("T")[0]}.pdf`,
    );
  } catch (error) {
    console.error("Error generating PDF:", error);
    throw error; // Re-throw so the calling function can handle it
  }
}

/**
 * Exports expense report data to PDF format
 * @param reportData The expense report data to export
 * @param startDate The start date of the report
 * @param endDate The end date of the report
 */
export async function exportExpenseReportToPDF(
  reportData: ExpenseReportData,
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
    const title = `Laporan Pengeluaran - ${new Date(
      reportData.startDate ?? new Date(),
    ).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })} s.d. ${new Date(reportData.endDate ?? new Date()).toLocaleDateString(
      "id-ID",
      {
        day: "numeric",
        month: "long",
        year: "numeric",
      },
    )}`;

    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text(title, doc.internal.pageSize.width / 2, 20, { align: "center" });
    doc.setFont("helvetica", "normal");

    // Add summary information section
    doc.setFontSize(12);
    const summaryY = 35; // Starting Y position for summary section

    // Add a header for Ringkasan Laporan
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    const summaryHeader = "Ringkasan Laporan Pengeluaran";
    doc.setTextColor(0, 0, 0);
    doc.text(summaryHeader, doc.internal.pageSize.width / 2, summaryY, {
      align: "center",
    }); // Center text
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0, 0, 0); // Reset text color

    // Create a summary table for expense report
    autoTable(doc, {
      head: [["Indikator", "Jumlah"]],
      body: [
        ["Total Pengeluaran", formatCurrency(reportData.totalExpenses)],
        ["Total Pendapatan", formatCurrency(reportData.totalRevenue)],
        ["Total Pesanan", reportData.totalOrders.toString()],
        [
          "Keuntungan Bersih",
          formatCurrency(reportData.totalRevenue - reportData.totalExpenses),
        ],
      ],
      startY: summaryY + 10, // Start below the header
      theme: "grid",
      headStyles: {
        fillColor: [66, 133, 244], // Google Blue
        textColor: [255, 255, 255],
        fontSize: 11,
        fontStyle: "bold",
        halign: "center", // Center align header
      },
      bodyStyles: {
        fontSize: 10,
        cellPadding: 5,
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
      tableWidth: "auto",
      columnStyles: {
        0: { cellWidth: "auto", halign: "left" }, // Indicator column
        1: { cellWidth: "auto", halign: "right" }, // Amount column - right aligned
      },
    });

    // Calculate starting Y position for the expense categories table based on the summary table
    const categoriesStartY = (doc as any).lastAutoTable
      ? (doc as any).lastAutoTable.finalY + 10
      : summaryY + 42; // Space below summary section

    // Add header for expense categories with centered text
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    const categoriesHeader = "Kategori Pengeluaran";
    doc.setTextColor(0, 0, 0);
    doc.text(
      categoriesHeader,
      doc.internal.pageSize.width / 2,
      categoriesStartY,
      { align: "center" },
    ); // Center text
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0, 0, 0); // Reset text color

    // Table for expense categories
    autoTable(doc, {
      head: [["#", "Kategori", "Jumlah"]],
      body: [
        [
          1,
          "Operasional",
          formatCurrency(reportData.expenseCategories?.operational || 0),
        ],
        [
          2,
          "Marketing",
          formatCurrency(reportData.expenseCategories?.marketing || 0),
        ],
        [3, "Gaji", formatCurrency(reportData.expenseCategories?.gaji || 0)],
        [
          4,
          "Lainnya",
          formatCurrency(reportData.expenseCategories?.lainnya || 0),
        ],
      ],
      startY: categoriesStartY + 5, // Position after the header text
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
        halign: "center", // Center align header
      },
      bodyStyles: {
        fontSize: 9, // Smaller body font
        cellPadding: 3,
      },
      // Better page break handling
      pageBreak: "auto",
      rowPageBreak: "avoid",
      // Column styles for right alignment on amount column
      columnStyles: {
        2: { halign: "right" }, // Amount column - right aligned
      },
    });

    // Add expenses table if there are any expenses
    if (reportData.expenses.length > 0) {
      const expensesHeader = "Daftar Pengeluaran";

      // Add header text for expenses
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text(
        expensesHeader,
        doc.internal.pageSize.width / 2,
        (doc as any).lastAutoTable
          ? (doc as any).lastAutoTable.finalY + 15
          : categoriesStartY + 5 + 25,
        { align: "center" },
      );
      doc.setFont("helvetica", "normal");

      // Calculate starting Y position for the table
      const expensesStartY = (doc as any).lastAutoTable
        ? (doc as any).lastAutoTable.finalY + 20
        : categoriesStartY + 5 + 30;

      // Calculate total expenses
      const totalExpenses = reportData.expenses.reduce(
        (sum: number, expense: { nominal: number }) => sum + expense.nominal,
        0,
      );

      // Prepare data for the expenses table with Nominal moved to the end
      const expensesData: (string | number)[][] = reportData.expenses.map(
        (
          expense: {
            date: Date;
            category: string;
            description: string | null;
            nominal: number;
          },
          index: number,
        ) => [
          index + 1,
          expense.date
            ? new Date(expense.date).toLocaleDateString("id-ID", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              })
            : "",
          expense.category === "operasional"
            ? "Operasional"
            : expense.category === "marketing"
              ? "Marketing"
              : expense.category === "gaji"
                ? "Gaji"
                : "Lainnya",
          expense.description || "-",
          formatCurrency(expense.nominal),
        ],
      );

      // Add total row to the expenses table
      const finalExpensesData = [
        ...expensesData,
        ["", "", "", "Total", formatCurrency(totalExpenses)], // Total row with merged cells where appropriate
      ];

      // Table for expenses
      autoTable(doc, {
        head: [["#", "Tanggal", "Kategori", "Deskripsi", "Nominal"]],
        body: finalExpensesData,
        startY: expensesStartY,
        tableWidth: "auto", // Make table width auto
        styles: {
          cellPadding: 3,
          fontSize: 8, // Smaller font size for better fit
        },
        headStyles: {
          fillColor: [220, 53, 69], // Red
          textColor: [255, 255, 255],
          fontSize: 9, // Smaller header font
          fontStyle: "bold",
          cellPadding: 3,
          halign: "center", // Center align header
        },
        bodyStyles: {
          fontSize: 8, // Smaller body font
          cellPadding: 3,
        },
        // Better page break handling
        pageBreak: "auto",
        rowPageBreak: "avoid",
        // Column widths and alignments
        columnStyles: {
          0: { cellWidth: 8 }, // Index column
          1: { cellWidth: 25 }, // Date column
          2: { cellWidth: 30 }, // Category column
          3: { cellWidth: "auto" }, // Description column
          4: { cellWidth: 30, halign: "right" }, // Amount column - right aligned (now in position 4)
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
      `laporan-pengeluaran-${startDate.toISOString().split("T")[0]}-${endDate.toISOString().split("T")[0]}.pdf`,
    );
  } catch (error) {
    console.error("Error generating PDF:", error);
    throw error; // Re-throw so the calling function can handle it
  }
}

/**
 * Exports margin report data to PDF format
 * @param reportData The margin report data to export
 * @param startDate The start date of the report
 * @param endDate The end date of the report
 */
export async function exportMarginReportToPDF(
  reportData: MarginReportData,
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
    const title = `Laporan Margin - ${new Date(
      reportData.startDate ?? new Date(),
    ).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })} s.d. ${new Date(reportData.endDate ?? new Date()).toLocaleDateString(
      "id-ID",
      {
        day: "numeric",
        month: "long",
        year: "numeric",
      },
    )}`;

    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text(title, doc.internal.pageSize.width / 2, 20, { align: "center" });
    doc.setFont("helvetica", "normal");

    // Add summary information section
    doc.setFontSize(12);
    const summaryY = 35; // Starting Y position for summary section

    // Add a header for Ringkasan Laporan
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    const summaryHeader = "Ringkasan Laporan Margin";
    doc.setTextColor(0, 0, 0);
    doc.text(summaryHeader, doc.internal.pageSize.width / 2, summaryY, {
      align: "center",
    }); // Center text
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0, 0, 0); // Reset text color

    // Create a summary table for margin report
    autoTable(doc, {
      head: [["Indikator", "Jumlah"]],
      body: [
        ["Total Pendapatan", formatCurrency(reportData.totalRevenue)],
        ["Total Biaya", formatCurrency(reportData.totalCost)],
        [
          "Keuntungan Kotor",
          formatCurrency(reportData.totalRevenue - reportData.totalCost),
        ],
        ["Keuntungan Bersih", formatCurrency(reportData.totalProfit)],
        ["Gross Margin", `${reportData.grossMargin?.toFixed(2) || 0}%`],
        ["Net Margin", `${reportData.netMargin?.toFixed(2) || 0}%`],
      ],
      startY: summaryY + 10, // Start below the header
      theme: "grid",
      headStyles: {
        fillColor: [66, 133, 244], // Google Blue
        textColor: [255, 255, 255],
        fontSize: 11,
        fontStyle: "bold",
        halign: "center", // Center align header
      },
      bodyStyles: {
        fontSize: 10,
        cellPadding: 5,
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
      tableWidth: "auto",
      columnStyles: {
        0: { cellWidth: "auto", halign: "left" }, // Indicator column
        1: { cellWidth: "auto", halign: "right" }, // Amount column - right aligned
      },
    });

    // Add product margins table
    if (reportData.productMargins.length > 0) {
      // Calculate starting Y position based on the finalY of the summary table
      const productMarginsStartY = (doc as any).lastAutoTable
        ? (doc as any).lastAutoTable.finalY + 15
        : summaryY + 65; // Space below summary section

      // Add header for product margins with centered text
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      const productMarginsHeader = "Margin Produk Teratas";
      doc.setTextColor(0, 0, 0);
      doc.text(
        productMarginsHeader,
        doc.internal.pageSize.width / 2,
        productMarginsStartY,
        { align: "center" },
      ); // Center text
      doc.setFont("helvetica", "normal");
      doc.setTextColor(0, 0, 0); // Reset text color

      // Calculate totals for product margins
      const totalCost = reportData.productMargins.reduce(
        (sum: number, product: { cost: number }) => sum + product.cost,
        0,
      );
      const totalRevenue = reportData.productMargins.reduce(
        (sum: number, product: { revenue: number }) => sum + product.revenue,
        0,
      );
      const totalProfit = reportData.productMargins.reduce(
        (sum: number, product: { profit: number }) => sum + product.profit,
        0,
      );

      // Table for product margins
      autoTable(doc, {
        head: [["#", "Nama Produk", "Biaya", "Pendapatan", "Laba", "Margin"]],
        body: [
          ...reportData.productMargins.map(
            (
              product: {
                name: string;
                cost: number;
                revenue: number;
                profit: number;
                margin: number;
              },
              index: number,
            ) => [
              index + 1,
              product.name,
              formatCurrency(product.cost),
              formatCurrency(product.revenue),
              formatCurrency(product.profit),
              `${product.margin.toFixed(2)}%`,
            ],
          ),
          // Add total row
          [
            "", // Index column
            "Total", // Product name column
            formatCurrency(totalCost), // Cost column
            formatCurrency(totalRevenue), // Revenue column
            formatCurrency(totalProfit), // Profit column
            "", // Margin column
          ],
        ],
        startY: productMarginsStartY + 12, // Position after the header text (increased from 5 to 12 to account for the header)
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
          halign: "center", // Center align header
        },
        bodyStyles: {
          fontSize: 9, // Smaller body font
          cellPadding: 3,
        },
        // Better page break handling
        pageBreak: "auto",
        rowPageBreak: "avoid",
        // Column styles for right alignment on monetary columns
        columnStyles: {
          2: { halign: "right" }, // Cost column - right aligned
          3: { halign: "right" }, // Revenue column - right aligned
          4: { halign: "right" }, // Profit column - right aligned
        },
      });
    }

    // Add orders table if there are any orders
    if (reportData.orders.length > 0) {
      const ordersHeader = "Daftar Pesanan dengan Margin";

      // Add header text for orders
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text(
        ordersHeader,
        doc.internal.pageSize.width / 2,
        (doc as any).lastAutoTable
          ? (doc as any).lastAutoTable.finalY + 15
          : reportData.productMargins.length > 0
            ? (doc as any).lastAutoTable
              ? (doc as any).lastAutoTable.finalY + 15
              : summaryY + 65 + 25 + 15
            : summaryY + 65 + 15,
        { align: "center" },
      );
      doc.setFont("helvetica", "normal");

      // Calculate starting Y position for the table
      let ordersStartY = (doc as any).lastAutoTable
        ? (doc as any).lastAutoTable.finalY + 20
        : reportData.productMargins.length > 0
          ? summaryY + 65 + 25 + 20
          : summaryY + 65 + 20;

      // Calculate totals for orders
      const totalOrderAmount = reportData.orders.reduce(
        (sum: number, order: { totalAmount: number }) =>
          sum + order.totalAmount,
        0,
      );
      const totalOrderCost = reportData.orders.reduce(
        (sum: number, order: { cost: number }) => sum + order.cost,
        0,
      );
      const totalOrderProfit = reportData.orders.reduce(
        (sum: number, order: { profit: number }) => sum + order.profit,
        0,
      );

      // Table for orders
      autoTable(doc, {
        head: [
          ["#", "Tanggal", "No. Order", "Total", "Biaya", "Laba", "Margin"],
        ],
        body: [
          ...reportData.orders.map(
            (
              order: {
                createdAt: Date;
                orderNumber: string;
                totalAmount: number;
                cost: number;
                profit: number;
                margin: number;
              },
              index: number,
            ) => [
              index + 1,
              order.createdAt
                ? new Date(order.createdAt).toLocaleDateString("id-ID", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  })
                : "",
              order.orderNumber,
              formatCurrency(order.totalAmount),
              formatCurrency(order.cost),
              formatCurrency(order.profit),
              `${order.margin.toFixed(2)}%`,
            ],
          ),
          // Add total row
          [
            "", // Index column
            "Total", // Date column
            "", // Order number column
            formatCurrency(totalOrderAmount), // Total column
            formatCurrency(totalOrderCost), // Cost column
            formatCurrency(totalOrderProfit), // Profit column
            "", // Margin column
          ],
        ],
        startY: ordersStartY,
        styles: {
          cellPadding: 3,
          fontSize: 9, // Smaller font size for better fit
        },
        headStyles: {
          fillColor: [52, 199, 89], // Green
          textColor: [255, 255, 255],
          fontSize: 9, // Smaller header font
          fontStyle: "bold",
          cellPadding: 3,
          halign: "center", // Center align header
        },
        bodyStyles: {
          fontSize: 9, // Smaller body font
          cellPadding: 3,
        },
        // Better page break handling
        pageBreak: "auto",
        rowPageBreak: "avoid",
        // Column widths and alignments
        columnStyles: {
          0: { cellWidth: 10 }, // Index column
          1: { cellWidth: "auto" }, // Date column
          2: { cellWidth: "auto" }, // Order number column
          3: { cellWidth: "auto", halign: "right" }, // Total column - right aligned
          4: { cellWidth: "auto", halign: "right" }, // Cost column - right aligned
          5: { cellWidth: "auto", halign: "right" }, // Profit column - right aligned
          6: { cellWidth: 20 }, // Margin column
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
      `laporan-margin-${startDate.toISOString().split("T")[0]}-${endDate.toISOString().split("T")[0]}.pdf`,
    );
  } catch (error) {
    console.error("Error generating PDF:", error);
    throw error; // Re-throw so the calling function can handle it
  }
}

/**
 * Exports order receipt data to PDF format (POS 58mm width)
 * @param order The order data to export as receipt
 * @param settings The store settings for business information
 */
export async function exportOrderReceiptToPDF(
  order: Order,
  settings: Setting,
): Promise<void> {
  try {
    // Dynamically import jsPDF
    const jsPDFModule = await import("jspdf");
    const { jsPDF } = jsPDFModule;
    
    // Create a new PDF document with POS 58mm width
    const doc = new jsPDF('p', 'mm', [58, 250]); // 58mm width, height can be dynamic

    // Set default font
    doc.setFont("helvetica", "normal");
    
    // Add business header information
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text(settings.name || "CETAK AJA ONLINE", 29, 10, { align: "center" }); // Center-align business name
    doc.setFont("helvetica", "normal");
    
    // Add business contact information
    doc.setFontSize(8);
    doc.text("Web : https://cetakaja.online", 29, 15, { align: "center" });
    doc.text("Email : cetakonlineyuk@gmail.com", 29, 19, { align: "center" });
    doc.text("WhatsApp : 0851-1754-8556", 29, 23, { align: "center" });
    doc.text("Shopee : @cetakajaonline", 29, 27, { align: "center" });
    doc.text("Tokopedia : @cetakajaonline", 29, 31, { align: "center" });
    doc.text("Tiktok : @cetakajaonline", 29, 35, { align: "center" });
    
    // Add separator line
    doc.line(2, 38, 56, 38);
    
    // Add order information
    let yPos = 42;
    
    yPos += 4;
    
    doc.text(`No. Order`, 2, yPos);
    doc.text(order.orderNumber, 25, yPos);
    
    yPos += 4;
    doc.text(`Tanggal`, 2, yPos);
    doc.text(order.createdAt ? new Date(order.createdAt).toLocaleString("id-ID", {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }) : "", 25, yPos);
    
    yPos += 4;
    doc.text(`Pelanggan`, 2, yPos);
    doc.text(order.user.name, 25, yPos);
    
    // Payment method only
    yPos += 4;
    doc.text(`Pembayaran`, 2, yPos);
    doc.setFont("helvetica", "normal");
    doc.text(order.paymentMethod === 'transfer' ? 'Transfer' : order.paymentMethod === 'qris' ? 'QRIS' : 'Tunai', 25, yPos);
    doc.setFont("helvetica", "normal");
    
    // Delivery method
    yPos += 4;
    doc.text(`Pengiriman`, 2, yPos);
    doc.setFont("helvetica", "normal");
    doc.text(order.shippingMethod === 'pickup' ? 'Pickup' : 'Delivery', 25, yPos);
    doc.setFont("helvetica", "normal");
    
    yPos += 6;
    // Add separator line
    doc.line(2, yPos, 56, yPos);
    yPos += 5;
    
    // Add order items header with better formatting
    doc.setFont("helvetica", "bold");
    doc.text("Item", 2, yPos);
    doc.text("Qty", 30, yPos);
    doc.text("Harga", 40, yPos);
    yPos += 3;
    // Add separator line
    doc.line(2, yPos, 56, yPos);
    yPos += 6;
    doc.setFont("helvetica", "normal");
    
    // Add order items with better formatting
    for (const item of order.orderItems) {
      // Item name first
      const itemName = item.product.name;
      const nameLines = splitTextToSize(itemName, 30, doc);
      
      // Add product name
      for (let i = 0; i < nameLines.length; i++) {
        doc.text(nameLines[i], 2, yPos);
        // Only show qty and price on the first line
        if (i === 0) {
          doc.text(`${item.qty}`, 30, yPos);
          doc.text(formatNumber(item.price), 40, yPos);
        }
        yPos += 5;
      }
      
      // Add options (variants) on separate lines
      if (item.options && item.options.length > 0) {
        for (const opt of item.options) {
          const optionText = `${opt.option?.variant?.variantName}: ${opt.optionName}`;
          const optionLines = splitTextToSize(optionText, 30, doc);
          
          for (const optionLine of optionLines) {
            doc.text(optionLine, 5, yPos); // Indented to show it's a sub-item
            yPos += 5;
          }
        }
      }
    }
    
    // Add separator line before total
    doc.line(2, yPos, 56, yPos);
    yPos += 6; // Extra space before total
    
    // Add total amount with proper alignment to fit within width
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("TOTAL", 2, yPos);
    // Right-align the total amount with proper padding from the right edge
    const totalText = formatCurrency(order.totalAmount);
    doc.text(totalText, 56, yPos, { align: "right" });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    
    // Add notes if available
    if (order.notes) {
      yPos += 4;
      doc.line(2, yPos, 56, yPos); // Add separator line before notes
      yPos += 6;
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.text("Catatan", 2, yPos);
      doc.setFont("helvetica", "normal");
      yPos += 6;
      const noteLines = splitTextToSize(order.notes, 52, doc);
      for (const line of noteLines) {
        doc.text(line, 2, yPos);
        yPos += 4;
      }
    }
    
    yPos += 2;
    doc.line(2, yPos, 56, yPos);
      
    // Add footer message
    yPos += 6;
    doc.setFontSize(8);
    const messageLine1 = "Terima kasih sudah mempercayakan kami untuk semua urusan cetakannya";
    const messageLine2 = "Silakan simpan nota ini sebagai bukti pembelian";
    const messageLine3 = "Barang yang sudah dibeli tidak dapat ditukar/dikembalikan";
    
    const lines1 = splitTextToSize(messageLine1, 52, doc);
    for (const line of lines1) {
      doc.text(line, 28, yPos, { align: "center" });
      yPos += 4;
    }
    
    const lines2 = splitTextToSize(messageLine2, 52, doc);
    for (const line of lines2) {
      doc.text(line, 28, yPos, { align: "center" });
      yPos += 4;
    }
    
    const lines3 = splitTextToSize(messageLine3, 52, doc);
    for (const line of lines3) {
      doc.text(line, 28, yPos, { align: "center" });
      yPos += 4;
    }
    
    // Save the PDF with order number in filename
    doc.save(`nota-${order.orderNumber}.pdf`);
  } catch (error) {
    console.error("Error generating receipt PDF:", error);
    throw error; // Re-throw so the calling function can handle it
  }
}

// Helper function to split text to fit within a given width
function splitTextToSize(text: string, maxWidth: number, doc: any): string[] {
  if (!text) return [];
  
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    // Add word to current line to test if it fits
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const textSize = doc.getTextWidth(testLine);
    
    if (textSize < maxWidth) {
      currentLine = testLine;
    } else {
      // If currentLine is not empty, push it to lines and start new line with current word
      if (currentLine) {
        lines.push(currentLine);
      }
      // Check if the single word is longer than maxWidth
      if (doc.getTextWidth(word) > maxWidth) {
        // If the single word is too long, break it into smaller parts
        const brokenWord = breakLongWord(word, maxWidth, doc);
        lines.push(...brokenWord);
      } else {
        currentLine = word;
      }
    }
  }

  // Push the last line if not empty
  if (currentLine) {
    lines.push(currentLine);
  }
  
  return lines;
}

// Helper function to break a long word into smaller parts
function breakLongWord(word: string, maxWidth: number, doc: any): string[] {
  const parts: string[] = [];
  let currentPart = '';
  
  for (const char of word) {
    const test = currentPart + char;
    if (doc.getTextWidth(test) > maxWidth) {
      if (currentPart) parts.push(currentPart);
      currentPart = char;
    } else {
      currentPart = test;
    }
  }
  
  if (currentPart) parts.push(currentPart);
  
  return parts;
}
