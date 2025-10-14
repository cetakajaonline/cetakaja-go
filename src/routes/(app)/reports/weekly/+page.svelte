<script lang="ts">
  import DefaultLayout from "$lib/layouts/DefaultLayout.svelte";
  import PageHeader from "$lib/components/PageHeader.svelte";
  import WeeklyReportChart from "$lib/components/reports/WeeklyReportChart.svelte";
  import WeeklyReportSummary from "$lib/components/reports/WeeklyReportSummary.svelte";
  import WeeklyReportDetails from "$lib/components/reports/WeeklyReportDetails.svelte";
  import type { WeeklyReportData } from "$lib/types";
  import { onMount } from "svelte";

  export let data: { reportData: WeeklyReportData };

  const { reportData } = data;

  // Format dates for display only if reportData is available
  let formattedStartDate: string = '';
  let formattedEndDate: string = '';
  
  if (reportData && reportData.startDate && reportData.endDate) {
    formattedStartDate = new Date(reportData.startDate).toLocaleDateString("id-ID", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    
    formattedEndDate = new Date(reportData.endDate).toLocaleDateString("id-ID", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  // Function to refresh the report for a specific start date
  async function refreshReport(startDate: Date) {
    // Format date to YYYY-MM-DD while preserving the local date
    const year = startDate.getFullYear();
    const month = String(startDate.getMonth() + 1).padStart(2, '0');
    const day = String(startDate.getDate()).padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}`;
    
    window.location.href = `/reports/weekly?startDate=${formattedDate}`;
  }

  // Initialize date picker with the current report start date if available
  let selectedStartDate: Date | null = null;
  if (reportData && reportData.startDate) {
    selectedStartDate = new Date(reportData.startDate);
  }

  function handleDateChange(event: Event) {
    const target = event.target as HTMLInputElement;
    const newDate = new Date(target.value);
    refreshReport(newDate);
  }

  onMount(() => {
    // Set the date input to the current report start date if available
    const dateInput = document.getElementById(
      "report-start-date"
    ) as HTMLInputElement;
    if (dateInput && reportData && reportData.startDate) {
      // Format the date to YYYY-MM-DD string to set as the input value, preserving local date
      const reportStartDate = new Date(reportData.startDate);
      
      // Format the date manually to avoid timezone conversion issues
      const year = reportStartDate.getFullYear();
      const month = String(reportStartDate.getMonth() + 1).padStart(2, '0');
      const day = String(reportStartDate.getDate()).padStart(2, '0');
      const reportDateStr = `${year}-${month}-${day}`;
      
      // Set the input value to the report start date
      dateInput.value = reportDateStr;
    }
  });
  
  // Import and use export functions
  async function exportToPDF() {
    if (!reportData || !reportData.startDate || !reportData.endDate) {
      alert('Data laporan tidak tersedia.');
      return;
    }
    
    try {
      const { exportWeeklyReportToPDF } = await import('$lib/utils/pdfExporter');
      await exportWeeklyReportToPDF(reportData, reportData.startDate, reportData.endDate);
    } catch (error) {
      console.error('Error exporting to PDF:', error);
      alert('Gagal mengekspor ke PDF. Silakan coba lagi.');
    }
  }
  
  async function exportToExcel() {
    if (!reportData || !reportData.startDate || !reportData.endDate) {
      alert('Data laporan tidak tersedia.');
      return;
    }
    
    try {
      const { exportWeeklyReportToExcel } = await import('$lib/utils/excelExporter');
      await exportWeeklyReportToExcel(reportData, reportData.startDate, reportData.endDate);
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      alert('Gagal mengekspor ke Excel. Silakan coba lagi.');
    }
  }
</script>

<DefaultLayout title="Weekly Report">
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
        <span class="mr-2">🗓️</span> Weekly
      </li>
    </ul>
  </div>
  <PageHeader title="Laporan Mingguan" icon="🗓️" />

  <div class="p-6">
    <!-- Date Selector -->
    <div class="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
      <div class="mb-4 md:mb-0">
        <label for="report-start-date" class="block text-sm font-medium mb-2"
          >Pilih Minggu Mulai</label
        >
        <input
          id="report-start-date"
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

    <!-- Report Date Range -->
    <div class="alert alert-info mb-6">
      <div>
        <span>Laporan mingguan: <strong>{formattedStartDate}</strong> - <strong>{formattedEndDate}</strong></span>
      </div>
    </div>

    <!-- Report Summary -->
    {#if reportData}
      <WeeklyReportSummary {reportData} />

      <!-- Chart Section -->
      <div class="mt-8">
        <WeeklyReportChart {reportData} />
      </div>

      <!-- Detailed Report -->
      <div class="mt-8">
        <WeeklyReportDetails {reportData} />
      </div>
    {:else}
      <div class="alert alert-warning">
        <div>
          <span>Memuat data laporan...</span>
        </div>
      </div>
    {/if}
  </div>
</DefaultLayout>