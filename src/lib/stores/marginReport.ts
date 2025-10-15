import { writable } from "svelte/store";
import type { MarginReportData } from "$lib/types";
import { getMarginReport } from "$lib/services/reportClient";

// Initial state for the margin report store
const initialReportState: {
  reportData: MarginReportData | null;
  loading: boolean;
  error: string | null;
} = {
  reportData: null,
  loading: false,
  error: null,
};

// Create the store
const createMarginReportStore = () => {
  const { subscribe, set, update } = writable(initialReportState);

  return {
    subscribe,

    // Fetch margin report data
    fetchReport: async (date?: string) => {
      update((state) => ({ ...state, loading: true, error: null }));

      try {
        const reportData = await getMarginReport(date);

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
    setReportData: (reportData: MarginReportData) => {
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
export const marginReportStore = createMarginReportStore();
