<script lang="ts">
  import DefaultLayout from "$lib/layouts/DefaultLayout.svelte";
  import PageHeader from "$lib/components/PageHeader.svelte";
  import MonthlyReportChart from "$lib/components/reports/MonthlyReportChart.svelte";
  import MonthlyReportSummary from "$lib/components/reports/MonthlyReportSummary.svelte";
  import MonthlyReportDetails from "$lib/components/reports/MonthlyReportDetails.svelte";
  import type { MonthlyReportData } from "$lib/types";
  import { onMount } from "svelte";

  export let data: { reportData: MonthlyReportData };

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

  // Function to refresh the report for a specific month
  async function refreshReport(year: number, month: number) {
    window.location.href = `/reports/monthly?year=${year}&month=${month}`;
  }

  // Initialize date picker with the current report month
  let selectedYear = new Date(reportData.startDate).getFullYear();
  let selectedMonth = new Date(reportData.startDate).getMonth() + 1; // month is 0-indexed

  function handleYearChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    const newYear = parseInt(target.value);
    refreshReport(newYear, selectedMonth);
  }

  function handleMonthChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    const newMonth = parseInt(target.value);
    refreshReport(selectedYear, newMonth);
  }

  onMount(() => {
    // Set the year and month selectors to the current report month
    const yearSelect = document.getElementById("report-year") as HTMLSelectElement;
    const monthSelect = document.getElementById("report-month") as HTMLSelectElement;
    
    if (yearSelect) {
      yearSelect.value = selectedYear.toString();
    }
    
    if (monthSelect) {
      monthSelect.value = selectedMonth.toString();
    }
  });
  
  // Generate year options (last 5 years to next 5 years)
  const currentYear = new Date().getFullYear();
  const yearOptions: number[] = [];
  for (let i = currentYear - 5; i <= currentYear + 5; i++) {
    yearOptions.push(i);
  }
  
  // Month options
  const monthOptions = [
    { value: 1, label: "Januari" },
    { value: 2, label: "Februari" },
    { value: 3, label: "Maret" },
    { value: 4, label: "April" },
    { value: 5, label: "Mei" },
    { value: 6, label: "Juni" },
    { value: 7, label: "Juli" },
    { value: 8, label: "Agustus" },
    { value: 9, label: "September" },
    { value: 10, label: "Oktober" },
    { value: 11, label: "November" },
    { value: 12, label: "Desember" }
  ];

  // Import and use export functions
  async function exportToPDF() {
    try {
      const { exportMonthlyReportToPDF } = await import('$lib/utils/pdfExporter');
      await exportMonthlyReportToPDF(reportData, reportData.startDate, reportData.endDate);
    } catch (error) {
      console.error('Error exporting to PDF:', error);
      alert('Gagal mengekspor ke PDF. Silakan coba lagi.');
    }
  }
  
  async function exportToExcel() {
    try {
      const { exportMonthlyReportToExcel } = await import('$lib/utils/excelExporter');
      await exportMonthlyReportToExcel(reportData, reportData.startDate, reportData.endDate);
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      alert('Gagal mengekspor ke Excel. Silakan coba lagi.');
    }
  }
</script>

<DefaultLayout title="Monthly Report">
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
        <span class="mr-2">📅</span> Monthly
      </li>
    </ul>
  </div>
  <PageHeader title="Laporan Bulanan" icon="📅" />

  <div class="p-6">
    <!-- Month Selector -->
    <div class="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
      <div class="mb-4 md:mb-0 flex flex-wrap gap-4">
        <div>
          <label for="report-year" class="block text-sm font-medium mb-2"
            >Pilih Tahun</label
          >
          <select
            id="report-year"
            class="select select-bordered w-full max-w-xs"
            on:change={handleYearChange}
          >
            {#each yearOptions as year}
              <option value={year}>{year}</option>
            {/each}
          </select>
        </div>
        
        <div>
          <label for="report-month" class="block text-sm font-medium mb-2"
            >Pilih Bulan</label
          >
          <select
            id="report-month"
            class="select select-bordered w-full max-w-xs"
            on:change={handleMonthChange}
          >
            {#each monthOptions as month}
              <option value={month.value}>{month.label}</option>
            {/each}
          </select>
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
        <span>Laporan bulanan: <strong>{formattedStartDate}</strong> - <strong>{formattedEndDate}</strong></span>
      </div>
    </div>

    <!-- Report Summary -->
    <MonthlyReportSummary {reportData} />

    <!-- Chart Section -->
    <div class="mt-8">
      <MonthlyReportChart {reportData} />
    </div>

    <!-- Detailed Report -->
    <div class="mt-8">
      <MonthlyReportDetails {reportData} />
    </div>
  </div>
</DefaultLayout>