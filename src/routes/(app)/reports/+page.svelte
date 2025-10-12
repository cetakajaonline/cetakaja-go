<script lang="ts">
  import ReportFilter from "$lib/components/ReportFilter.svelte";
  import ReportChart from "$lib/components/ReportChart.svelte";
  import ReportDetail from "$lib/components/ReportDetail.svelte";
  import DefaultLayout from "$lib/layouts/DefaultLayout.svelte";
  import PageHeader from "$lib/components/PageHeader.svelte";
  import {
    generateReport as generateReportAPI,
    exportReport as exportReportAPI,
  } from "$lib/services/reportClient";
  import {
    reportFilters,
    setCurrentReport,
    setLoading,
    setError,
    clearReports,
  } from "$lib/stores/report";
  import { get } from "svelte/store";
  import type {
    ReportFilter as ReportFilterType,
    ReportResponse,
  } from "$lib/types";
  import { onMount } from "svelte";

  let loading = $state(false);
  let error = $state<string | null>(null);
  let currentReport = $state<ReportResponse | null>(null);
  const initialFilters = $derived($reportFilters);

  // Load initial report on mount
  onMount(async () => {
    await generateReport(get(reportFilters));
  });

  async function handleFilterChange(filter: Partial<ReportFilterType>) {
    await generateReport(filter);
  }

  async function generateReport(filter: Partial<ReportFilterType>) {
    setLoading(true);
    setError(null);

    try {
      const fullFilter: ReportFilterType = {
        startDate:
          filter.startDate instanceof Date 
            ? filter.startDate 
            : filter.startDate 
              ? new Date(filter.startDate) 
              : new Date(new Date().setDate(new Date().getDate() - 7)),
        endDate: 
          filter.endDate instanceof Date 
            ? filter.endDate 
            : filter.endDate 
              ? new Date(filter.endDate) 
              : new Date(),
        reportType: filter.reportType || "daily",
        productId: filter.productId,
        userId: filter.userId,
      };

      const result = await generateReportAPI(fullFilter);
      setCurrentReport(result);
      currentReport = result;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error generating report";
      setError(errorMessage);
      console.error("Error generating report:", err);
    } finally {
      setLoading(false);
    }
  }

  async function exportReport(format: "pdf" | "xlsx" | "csv") {
    try {
      // Get current filter settings
      const filters = get(reportFilters);
      
      // Convert date strings to Date objects if needed
      const processedFilters = {
        ...filters,
        startDate: filters.startDate instanceof Date 
          ? filters.startDate 
          : filters.startDate 
            ? new Date(filters.startDate) 
            : undefined,
        endDate: filters.endDate instanceof Date 
          ? filters.endDate 
          : filters.endDate 
            ? new Date(filters.endDate) 
            : undefined,
      };
      
      await exportReportAPI(processedFilters as ReportFilterType, format);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error exporting report";
      setError(errorMessage);
      console.error("Error exporting report:", err);
    }
  }
</script>

<DefaultLayout title="Reports">
  <PageHeader title="Laporan" icon="📊" />

  {#if error}
    <div class="alert alert-error mb-4">
      <div>
        <span>{error}</span>
      </div>
    </div>
  {/if}

  <ReportFilter
    {initialFilters}
    {loading}
    on:applyFilters={(e) => handleFilterChange(e.detail)}
  />

  <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <ReportChart report={currentReport} {loading} />
    <ReportDetail report={currentReport} {loading} {exportReport} />
  </div>
</DefaultLayout>
