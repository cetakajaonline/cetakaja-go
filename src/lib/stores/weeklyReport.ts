import { writable } from "svelte/store";
import type { WeeklyReportData } from "$lib/types";

// Initial state for the weekly report store
const initialReportState: {
  reportData: WeeklyReportData | null;
  loading: boolean;
  error: string | null;
} = {
  reportData: null,
  loading: false,
  error: null,
};

// Create the store
const createWeeklyReportStore = () => {
  const { subscribe, set, update } = writable(initialReportState);

  return {
    subscribe,

    // Fetch weekly report data
    fetchReport: async (startDate?: string) => {
      update((state) => ({ ...state, loading: true, error: null }));

      try {
        const response = await fetch(
          startDate
            ? `/api/reports/weekly?startDate=${startDate}`
            : "/api/reports/weekly",
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to fetch weekly report");
        }

        const result = await response.json();

        update((state) => ({
          ...state,
          loading: false,
          reportData: result.data,
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
    setReportData: (reportData: WeeklyReportData) => {
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
export const weeklyReportStore = createWeeklyReportStore();
