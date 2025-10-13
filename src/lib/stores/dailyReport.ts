import { writable, type Writable } from 'svelte/store';
import type { DailyReportData } from '$lib/types';

// Initial state for the daily report store
const initialReportState: {
  reportData: DailyReportData | null;
  loading: boolean;
  error: string | null;
} = {
  reportData: null,
  loading: false,
  error: null
};

// Create the store
const createDailyReportStore = () => {
  const { subscribe, set, update } = writable(initialReportState);

  return {
    subscribe,
    
    // Fetch daily report data
    fetchReport: async (date?: string) => {
      update(state => ({ ...state, loading: true, error: null }));
      
      try {
        const response = await fetch(
          date ? `/api/reports/daily?date=${date}` : '/api/reports/daily'
        );
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch daily report');
        }
        
        const result = await response.json();
        
        update(state => ({
          ...state,
          loading: false,
          reportData: result.data,
          error: null
        }));
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        update(state => ({
          ...state,
          loading: false,
          error: errorMessage,
          reportData: null
        }));
      }
    },
    
    // Set report data directly (useful when data is already available)
    setReportData: (reportData: DailyReportData) => {
      update(state => ({
        ...state,
        reportData,
        loading: false,
        error: null
      }));
    },
    
    // Clear the store
    clear: () => {
      set(initialReportState);
    }
  };
};

// Export the store instance
export const dailyReportStore = createDailyReportStore();