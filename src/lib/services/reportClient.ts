// Client functions for daily and weekly report APIs
import type { DailyReportData, WeeklyReportData } from "$lib/types";

/**
 * Fetches daily report data for a specific date
 * @param date The date to fetch report for (format: YYYY-MM-DD)
 * @returns Promise resolving to daily report data
 */
export async function getDailyReport(date?: string): Promise<DailyReportData> {
  const url = date ? `/api/reports/daily?date=${date}` : "/api/reports/daily";

  const response = await fetch(url);

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to fetch daily report");
  }

  const result = await response.json();
  return result.data as DailyReportData;
}

/**
 * Fetches weekly report data for a specific start date (week beginning)
 * @param startDate The start date of the week to fetch report for (format: YYYY-MM-DD)
 * @returns Promise resolving to weekly report data
 */
export async function getWeeklyReport(
  startDate?: string,
): Promise<WeeklyReportData> {
  const url = startDate
    ? `/api/reports/weekly?startDate=${startDate}`
    : "/api/reports/weekly";

  const response = await fetch(url);

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to fetch weekly report");
  }

  const result = await response.json();
  return result.data as WeeklyReportData;
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
  const dateString = date.toISOString().split("T")[0];
  return getDailyReport(dateString);
}
