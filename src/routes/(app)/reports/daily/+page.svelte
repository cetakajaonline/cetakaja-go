<script lang="ts">
  import DefaultLayout from "$lib/layouts/DefaultLayout.svelte";
  import PageHeader from "$lib/components/PageHeader.svelte";
  import DailyReportChart from "$lib/components/reports/DailyReportChart.svelte";
  import DailyReportSummary from "$lib/components/reports/DailyReportSummary.svelte";
  import DailyReportDetails from "$lib/components/reports/DailyReportDetails.svelte";
  import type { DailyReportData } from "$lib/types";
  import { onMount } from "svelte";

  export let data: { reportData: DailyReportData };

  const { reportData } = data;

  // Format date for display - only if reportData and date exist
  let formattedDate = "Loading...";
  if (reportData && reportData.date) {
    formattedDate = new Date(reportData.date).toLocaleDateString("id-ID", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  // Initialize date picker with the current report date - only if reportData and date exist
  let selectedDate = new Date();
  if (reportData && reportData.date) {
    selectedDate = new Date(reportData.date);
  }

  // Function to refresh the report for a specific date
  async function refreshReport(date: Date) {
    // Format date to YYYY-MM-DD while preserving the local date
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}`;
    
    window.location.href = `/reports/daily?date=${formattedDate}`;
  }

  function handleDateChange(event: Event) {
    const target = event.target as HTMLInputElement;
    const newDate = new Date(target.value);
    refreshReport(newDate);
  }

  onMount(() => {
    // Set the date input to the current report date
    const dateInput = document.getElementById(
      "report-date"
    ) as HTMLInputElement;
    if (dateInput && reportData && reportData.date) {
      // Format the date to YYYY-MM-DD string to set as the input value, preserving local date
      const reportDate = new Date(reportData.date);
      
      // Format the date manually to avoid timezone conversion issues
      const year = reportDate.getFullYear();
      const month = String(reportDate.getMonth() + 1).padStart(2, '0');
      const day = String(reportDate.getDate()).padStart(2, '0');
      const reportDateStr = `${year}-${month}-${day}`;
      
      // Set the input value to the report date, which should be today by default
      dateInput.value = reportDateStr;
    }
  });
  
  // Import and use export functions
  async function exportToPDF() {
    if (!reportData || !reportData.date) {
      alert('Data laporan tidak tersedia. Silakan coba lagi.');
      return;
    }
    try {
      const { exportDailyReportToPDF } = await import('$lib/utils/pdfExporter');
      await exportDailyReportToPDF(reportData, reportData.date);
    } catch (error) {
      console.error('Error exporting to PDF:', error);
      alert('Gagal mengekspor ke PDF. Silakan coba lagi.');
    }
  }
  
  async function exportToExcel() {
    if (!reportData || !reportData.date) {
      alert('Data laporan tidak tersedia. Silakan coba lagi.');
      return;
    }
    try {
      const { exportDailyReportToExcel } = await import('$lib/utils/excelExporter');
      await exportDailyReportToExcel(reportData, reportData.date);
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      alert('Gagal mengekspor ke Excel. Silakan coba lagi.');
    }
  }
</script>

<DefaultLayout title="Daily Report">
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
        <span class="mr-2">📅</span> Daily
      </li>
    </ul>
  </div>
  <PageHeader title="Laporan Harian" icon="📅" />

  <div class="p-6">
    <!-- Date Selector -->
    <div class="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
      <div class="mb-4 md:mb-0">
        <label for="report-date" class="block text-sm font-medium mb-2"
          >Pilih Tanggal</label
        >
        <input
          id="report-date"
          type="date"
          class="input input-bordered w-full max-w-xs"
          on:change={handleDateChange}
        />
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

    <!-- Report Summary -->
    <DailyReportSummary {reportData} />

    <!-- Chart Section -->
    <div class="mt-8">
      <DailyReportChart {reportData} />
    </div>

    <!-- Detailed Report -->
    <div class="mt-8">
      <DailyReportDetails {reportData} />
    </div>
  </div>
</DefaultLayout>
