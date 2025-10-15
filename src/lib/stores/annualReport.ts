import { writable } from "svelte/store";
import type { AnnualReportData } from "$lib/types";
import { getAnnualReport } from "$lib/services/reportClient";

// Initial state for the annual report store
const initialReportState: {
  reportData: AnnualReportData | null;
  loading: boolean;
  error: string | null;
} = {
  reportData: null,
  loading: false,
  error: null,
};

// Create the store
const createAnnualReportStore = () => {
  const { subscribe, set, update } = writable(initialReportState);

  return {
    subscribe,

    // Fetch annual report data
    fetchReport: async (year?: number) => {
      update((state) => ({ ...state, loading: true, error: null }));

      try {
        const reportData = await getAnnualReport(year);

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
    setReportData: (reportData: AnnualReportData) => {
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
export const annualReportStore = createAnnualReportStore();
