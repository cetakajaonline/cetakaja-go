// Utility functions for PDF export
import type { DailyReportData, WeeklyReportData } from "$lib/types";

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

// Helper function to format currency
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}
