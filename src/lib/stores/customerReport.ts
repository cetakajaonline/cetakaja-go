import { writable } from "svelte/store";
import type { CustomerReportData } from "$lib/types";
import { getCustomerReport } from "$lib/services/reportClient";

// Initial state for the customer report store
const initialReportState: {
  reportData: CustomerReportData | null;
  loading: boolean;
  error: string | null;
} = {
  reportData: null,
  loading: false,
  error: null,
};

// Create the store
const createCustomerReportStore = () => {
  const { subscribe, set, update } = writable(initialReportState);

  return {
    subscribe,

    // Fetch customer report data
    fetchReport: async (startDate?: string, endDate?: string) => {
      update((state) => ({ ...state, loading: true, error: null }));

      try {
        const reportData = await getCustomerReport(startDate, endDate);

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
    setReportData: (reportData: CustomerReportData) => {
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
export const customerReportStore = createCustomerReportStore();
