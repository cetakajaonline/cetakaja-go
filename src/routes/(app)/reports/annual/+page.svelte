<script lang="ts">
  import DefaultLayout from "$lib/layouts/DefaultLayout.svelte";
  import PageHeader from "$lib/components/PageHeader.svelte";
  import AnnualReportChart from "$lib/components/reports/AnnualReportChart.svelte";
  import AnnualReportSummary from "$lib/components/reports/AnnualReportSummary.svelte";
  import AnnualReportDetails from "$lib/components/reports/AnnualReportDetails.svelte";
  import type { AnnualReportData } from "$lib/types";
  import { onMount } from "svelte";

  export let data: { reportData: AnnualReportData };

  const { reportData } = data;

  // Format year for display
  const formattedYear = reportData.year;

  // Function to refresh the report for a specific year
  async function refreshReport(year: number) {
    window.location.href = `/reports/annual?year=${year}`;
  }

  // Initialize year picker with the current report year
  let selectedYear = reportData.year;

  function handleYearChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    const newYear = parseInt(target.value);
    refreshReport(newYear);
  }

  onMount(() => {
    // Set the year selector to the current report year
    const yearSelect = document.getElementById("report-year") as HTMLSelectElement;
    
    if (yearSelect) {
      yearSelect.value = selectedYear.toString();
    }
  });
  
  // Generate year options (last 5 years to next 5 years)
  const currentYear = new Date().getFullYear();
  const yearOptions: number[] = [];
  for (let i = currentYear - 5; i <= currentYear + 5; i++) {
    yearOptions.push(i);
  }

  // Import and use export functions
  async function exportToPDF() {
    try {
      const { exportAnnualReportToPDF } = await import('$lib/utils/pdfExporter');
      await exportAnnualReportToPDF(reportData, reportData.year);
    } catch (error) {
      console.error('Error exporting to PDF:', error);
      alert('Gagal mengekspor ke PDF. Silakan coba lagi.');
    }
  }
  
  async function exportToExcel() {
    try {
      const { exportAnnualReportToExcel } = await import('$lib/utils/excelExporter');
      await exportAnnualReportToExcel(reportData, reportData.year);
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      alert('Gagal mengekspor ke Excel. Silakan coba lagi.');
    }
  }
</script>

<DefaultLayout title="Annual Report">
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
        <span class="mr-2">📅</span> Annual
      </li>
    </ul>
  </div>
  <PageHeader title="Laporan Tahunan" icon="📅" />

  <div class="p-6">
    <!-- Year Selector -->
    <div class="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
      <div class="mb-4 md:mb-0">
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
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 8.25H7.5a2.25 2.25 0 00-2.25 2.25v9a2.25 2.25 0 002.25 2.25h9a2.25 2.25 0 002.25-2.25v9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25H15m0-3l-3-3m0 0l-3 3m3-3V15" />
          </svg>
          Excel
        </button>
      </div>
    </div>

    <!-- Report Year -->
    <div class="alert alert-info mb-6">
      <div>
        <span>Laporan tahunan: <strong>Tahun {formattedYear}</strong></span>
      </div>
    </div>

    <!-- Report Summary -->
    <AnnualReportSummary {reportData} />

    <!-- Chart Section -->
    <div class="mt-8">
      <AnnualReportChart {reportData} />
    </div>

    <!-- Detailed Report -->
    <div class="mt-8">
      <AnnualReportDetails {reportData} />
    </div>
  </div>
</DefaultLayout>