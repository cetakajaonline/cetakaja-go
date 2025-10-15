import { writable } from "svelte/store";
import type { MonthlyReportData } from "$lib/types";
import { getMonthlyReport } from "$lib/services/reportClient";

// Initial state for the monthly report store
const initialReportState: {
  reportData: MonthlyReportData | null;
  loading: boolean;
  error: string | null;
} = {
  reportData: null,
  loading: false,
  error: null,
};

// Create the store
const createMonthlyReportStore = () => {
  const { subscribe, set, update } = writable(initialReportState);

  return {
    subscribe,

    // Fetch monthly report data
    fetchReport: async (year?: number, month?: number) => {
      update((state) => ({ ...state, loading: true, error: null }));

      try {
        const reportData = await getMonthlyReport(year, month);

        update((state) => ({
          ...state,
          loading: false,
          reportData,
          error: null,
        }));
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "An unknown error occurred";
        update((state) => ({
          ...state,
          loading: false,
          error: errorMessage,
          reportData: null,
        }));
      }
    },

    // Set report data directly (useful when data is already available)
    setReportData: (reportData: MonthlyReportData) => {
      update((state) => ({
        ...state,
        reportData,
        loading: false,
        error: null,
      }));
    },

    // Clear the store
    clear: () => {
      set(initialReportState);
    },
  };
};

// Export the store instance
export const monthlyReportStore = createMonthlyReportStore();
