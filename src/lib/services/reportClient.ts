// Client functions for daily report API
import type { DailyReportData } from '$lib/types';

/**
 * Fetches daily report data for a specific date
 * @param date The date to fetch report for (format: YYYY-MM-DD)
 * @returns Promise resolving to daily report data
 */
export async function getDailyReport(date?: string): Promise<DailyReportData> {
  const url = date 
    ? `/api/reports/daily?date=${date}` 
    : '/api/reports/daily';
  
  const response = await fetch(url);
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to fetch daily report');
  }
  
  const result = await response.json();
  return result.data;
}

/**
 * Fetches daily report data for today
 * @returns Promise resolving to daily report data for today
 */
export async function getTodaysReport(): Promise<DailyReportData> {
  return getDailyReport();
}

/**
 * Fetches daily report data for a specific date
 * @param date The date to fetch report for
 * @returns Promise resolving to daily report data
 */
export async function getReportForDate(date: Date): Promise<DailyReportData> {
  const dateString = date.toISOString().split('T')[0];
  return getDailyReport(dateString);
}