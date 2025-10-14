<script lang="ts">
  import DefaultLayout from "$lib/layouts/DefaultLayout.svelte";
  import PageHeader from "$lib/components/PageHeader.svelte";
  import ProductReportChart from "$lib/components/reports/ProductReportChart.svelte";
  import ProductReportSummary from "$lib/components/reports/ProductReportSummary.svelte";
  import ProductReportDetails from "$lib/components/reports/ProductReportDetails.svelte";
  import type { ProductReportData } from "$lib/types";
  import { onMount } from "svelte";

  export let data: { reportData: ProductReportData };

  const { reportData } = data;

  // Format date range for display
  const formattedStartDate = new Date(reportData.startDate).toLocaleDateString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  
  const formattedEndDate = new Date(reportData.endDate).toLocaleDateString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Function to refresh the report for a specific date range
  async function refreshReport(startDate: Date, endDate: Date) {
    // Format dates to YYYY-MM-DD while preserving the local date
    const startYear = startDate.getFullYear();
    const startMonth = String(startDate.getMonth() + 1).padStart(2, '0');
    const startDay = String(startDate.getDate()).padStart(2, '0');
    const startFormattedDate = `${startYear}-${startMonth}-${startDay}`;
    
    const endYear = endDate.getFullYear();
    const endMonth = String(endDate.getMonth() + 1).padStart(2, '0');
    const endDay = String(endDate.getDate()).padStart(2, '0');
    const endFormattedDate = `${endYear}-${endMonth}-${endDay}`;
    
    window.location.href = `/reports/product?startDate=${startFormattedDate}&endDate=${endFormattedDate}`;
  }

  // Initialize date pickers with the current report date range
  let selectedStartDate = new Date(reportData.startDate);
  let selectedEndDate = new Date(reportData.endDate);

  function handleStartDateChange(event: Event) {
    const target = event.target as HTMLInputElement;
    const newDate = new Date(target.value);
    selectedStartDate = newDate;
    // Only refresh if both dates are set
    if (selectedStartDate && selectedEndDate) {
      refreshReport(selectedStartDate, selectedEndDate);
    }
  }

  function handleEndDateChange(event: Event) {
    const target = event.target as HTMLInputElement;
    const newDate = new Date(target.value);
    selectedEndDate = newDate;
    // Only refresh if both dates are set
    if (selectedStartDate && selectedEndDate) {
      refreshReport(selectedStartDate, selectedEndDate);
    }
  }

  onMount(() => {
    // Set the date inputs to the current report date range
    const startDateInput = document.getElementById(
      "report-start-date"
    ) as HTMLInputElement;
    if (startDateInput) {
      // Format the date to YYYY-MM-DD string to set as the input value, preserving local date
      const reportStartDate = new Date(reportData.startDate);
      
      // Format the date manually to avoid timezone conversion issues
      const year = reportStartDate.getFullYear();
      const month = String(reportStartDate.getMonth() + 1).padStart(2, '0');
      const day = String(reportStartDate.getDate()).padStart(2, '0');
      const reportDateStr = `${year}-${month}-${day}`;
      
      // Set the input value to the report start date
      startDateInput.value = reportDateStr;
    }
    
    const endDateInput = document.getElementById(
      "report-end-date"
    ) as HTMLInputElement;
    if (endDateInput) {
      // Format the date to YYYY-MM-DD string to set as the input value, preserving local date
      const reportEndDate = new Date(reportData.endDate);
      
      // Format the date manually to avoid timezone conversion issues
      const year = reportEndDate.getFullYear();
      const month = String(reportEndDate.getMonth() + 1).padStart(2, '0');
      const day = String(reportEndDate.getDate()).padStart(2, '0');
      const reportDateStr = `${year}-${month}-${day}`;
      
      // Set the input value to the report end date
      endDateInput.value = reportDateStr;
    }
  });
  
  // Import and use export functions
  async function exportToPDF() {
    try {
      const { exportProductReportToPDF } = await import('$lib/utils/pdfExporter');
      await exportProductReportToPDF(reportData, reportData.startDate, reportData.endDate);
    } catch (error) {
      console.error('Error exporting to PDF:', error);
      alert('Gagal mengekspor ke PDF. Silakan coba lagi.');
    }
  }
  
  async function exportToExcel() {
    try {
      const { exportProductReportToExcel } = await import('$lib/utils/excelExporter');
      await exportProductReportToExcel(reportData, reportData.startDate, reportData.endDate);
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      alert('Gagal mengekspor ke Excel. Silakan coba lagi.');
    }
  }
</script>

<DefaultLayout title="Product Report">
  <div class="mb-4 breadcrumbs text-sm">
    <ul>
      <li>
        <a href="/" class="flex items-center">
          <span class="mr-2">🏠</span> Beranda
        </a>
      </li>
      <li>
        <a href="/reports" class="flex items-center">
          <span class="mr-2">📊</span> Reports
        </a>
      </li>
      <li class="flex items-center">
        <span class="mr-2">📦</span> Product
      </li>
    </ul>
  </div>
  <PageHeader title="Laporan Produk" icon="📦" />

  <div class="p-6">
    <!-- Date Selector -->
    <div class="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
      <div class="mb-4 md:mb-0 flex flex-wrap gap-4">
        <div>
          <label for="report-start-date" class="block text-sm font-medium mb-2"
            >Tanggal Awal</label
          >
          <input
            id="report-start-date"
            type="date"
            class="input input-bordered w-full max-w-xs"
            on:change={handleStartDateChange}
          />
        </div>
        
        <div>
          <label for="report-end-date" class="block text-sm font-medium mb-2"
            >Tanggal Akhir</label
          >
          <input
            id="report-end-date"
            type="date"
            class="input input-bordered w-full max-w-xs"
            on:change={handleEndDateChange}
          />
        </div>
      </div>
      
      <!-- Export Buttons -->
      <div class="flex space-x-2">
        <button 
          class="btn btn-outline btn-primary"
          on:click={exportToPDF}
          title="Ekspor ke PDF"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 mr-2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
          </svg>
          PDF
        </button>
        <button 
          class="btn btn-outline btn-success"
          on:click={exportToExcel}
          title="Ekspor ke Excel"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 mr-2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 8.25H7.5a2.25 2.25 0 00-2.25 2.25v9a2.25 2.25 0 002.25 2.25h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25H15m0-3l-3-3m0 0l-3 3m3-3V15" />
          </svg>
          Excel
        </button>
      </div>
    </div>

    <!-- Report Date Range -->
    <div class="alert alert-info mb-6">
      <div>
        <span>Laporan produk: <strong>{formattedStartDate}</strong> - <strong>{formattedEndDate}</strong></span>
      </div>
    </div>

    <!-- Report Summary -->
    <ProductReportSummary {reportData} />

    <!-- Chart Section -->
    <div class="mt-8">
      <ProductReportChart {reportData} />
    </div>

    <!-- Detailed Report -->
    <div class="mt-8">
      <ProductReportDetails {reportData} />
    </div>
  </div>
</DefaultLayout>