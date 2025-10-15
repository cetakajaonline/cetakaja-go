import { writable } from "svelte/store";
import type { ExpenseReportData } from "$lib/types";
import { getExpenseReport } from "$lib/services/reportClient";

// Initial state for the expense report store
const initialReportState: {
  reportData: ExpenseReportData | null;
  loading: boolean;
  error: string | null;
} = {
  reportData: null,
  loading: false,
  error: null,
};

// Create the store
const createExpenseReportStore = () => {
  const { subscribe, set, update } = writable(initialReportState);

  return {
    subscribe,

    // Fetch expense report data
    fetchReport: async (date?: string) => {
      update((state) => ({ ...state, loading: true, error: null }));

      try {
        const reportData = await getExpenseReport(date);

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
    setReportData: (reportData: ExpenseReportData) => {
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
export const expenseReportStore = createExpenseReportStore();
