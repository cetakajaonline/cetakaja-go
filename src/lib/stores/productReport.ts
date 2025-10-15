import { writable } from "svelte/store";
import type { ProductReportData } from "$lib/types";
import { getProductReport } from "$lib/services/reportClient";

// Initial state for the product report store
const initialReportState: {
  reportData: ProductReportData | null;
  loading: boolean;
  error: string | null;
} = {
  reportData: null,
  loading: false,
  error: null,
};

// Create the store
const createProductReportStore = () => {
  const { subscribe, set, update } = writable(initialReportState);

  return {
    subscribe,

    // Fetch product report data
    fetchReport: async (startDate?: string, endDate?: string) => {
      update((state) => ({ ...state, loading: true, error: null }));

      try {
        const reportData = await getProductReport(startDate, endDate);

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
    setReportData: (reportData: ProductReportData) => {
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
export const productReportStore = createProductReportStore();
