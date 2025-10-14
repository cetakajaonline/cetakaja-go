import { writable } from "svelte/store";
import type { RevenueReportData } from "$lib/types";
import { getRevenueReport } from "$lib/services/reportClient";

// Initial state for the revenue report store
const initialReportState: {
  reportData: RevenueReportData | null;
  loading: boolean;
  error: string | null;
} = {
  reportData: null,
  loading: false,
  error: null,
};

// Create the store
const createRevenueReportStore = () => {
  const { subscribe, set, update } = writable(initialReportState);

  return {
    subscribe,

    // Fetch revenue report data
    fetchReport: async (date?: string) => {
      update((state) => ({ ...state, loading: true, error: null }));

      try {
        const reportData = await getRevenueReport(date);

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
    setReportData: (reportData: RevenueReportData) => {
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
export const revenueReportStore = createRevenueReportStore();