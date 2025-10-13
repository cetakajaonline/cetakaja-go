// src/lib/stores/report.ts
import { writable, derived } from "svelte/store";
import type { ReportResponse, ReportFilter } from "$lib/types";

export const reports = writable<ReportResponse[]>([]);
export const currentReport = writable<ReportResponse | null>(null);
export const loading = writable(false);
export const error = writable<string | null>(null);
export const reportFilters = writable<Partial<ReportFilter>>({
  reportType: "daily",
  startDate: new Date(new Date().setDate(new Date().getDate() - 7)), // Default to last 7 days
  endDate: new Date(),
});

// Computed store for filtered reports
export const filteredReports = derived(
  [reports, reportFilters],
  ([$reports, $filters]) => {
    if (!$filters.reportType) return $reports;

    return $reports.filter(
      (report) => report.reportType === $filters.reportType,
    );
  },
);

// Actions
export const setReportFilters = (filters: Partial<ReportFilter>) => {
  reportFilters.update((prev) => ({ ...prev, ...filters }));
};

export const addReport = (report: ReportResponse) => {
  reports.update((items) => [...items, report]);
};

export const setCurrentReport = (report: ReportResponse | null) => {
  currentReport.set(report);
};

export const setLoading = (status: boolean) => {
  loading.set(status);
};

export const setError = (message: string | null) => {
  error.set(message);
};

export const clearReports = () => {
  reports.set([]);
  setCurrentReport(null);
};
