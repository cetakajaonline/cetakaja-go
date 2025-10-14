// Client functions for daily, weekly, monthly, annual, customer, and product report APIs
import type {
  DailyReportData,
  WeeklyReportData,
  MonthlyReportData,
  AnnualReportData,
  CustomerReportData,
  ProductReportData,
} from "$lib/types";

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
 * Fetches monthly report data for a specific month
 * @param year The year to fetch report for
 * @param month The month to fetch report for (1-12)
 * @returns Promise resolving to monthly report data
 */
export async function getMonthlyReport(
  year?: number,
  month?: number,
): Promise<MonthlyReportData> {
  const params = new URLSearchParams();
  if (year !== undefined) params.append("year", year.toString());
  if (month !== undefined) params.append("month", month.toString());

  const queryString = params.toString();
  const url = queryString
    ? `/api/reports/monthly?${queryString}`
    : "/api/reports/monthly";

  const response = await fetch(url);

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to fetch monthly report");
  }

  const result = await response.json();
  return result.data as MonthlyReportData;
}

/**
 * Fetches annual report data for a specific year
 * @param year The year to fetch report for
 * @returns Promise resolving to annual report data
 */
export async function getAnnualReport(
  year?: number,
): Promise<AnnualReportData> {
  const params = new URLSearchParams();
  if (year !== undefined) params.append("year", year.toString());

  const queryString = params.toString();
  const url = queryString
    ? `/api/reports/annual?${queryString}`
    : "/api/reports/annual";

  const response = await fetch(url);

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to fetch annual report");
  }

  const result = await response.json();
  return result.data as AnnualReportData;
}

/**
 * Fetches customer report data for a specific date range
 * @param startDate The start date for the report (format: YYYY-MM-DD)
 * @param endDate The end date for the report (format: YYYY-MM-DD)
 * @returns Promise resolving to customer report data
 */
export async function getCustomerReport(
  startDate?: string,
  endDate?: string,
): Promise<CustomerReportData> {
  const params = new URLSearchParams();
  if (startDate !== undefined) params.append("startDate", startDate);
  if (endDate !== undefined) params.append("endDate", endDate);

  const queryString = params.toString();
  const url = queryString
    ? `/api/reports/customer?${queryString}`
    : "/api/reports/customer";

  const response = await fetch(url);

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to fetch customer report");
  }

  const result = await response.json();
  return result.data as CustomerReportData;
}

/**
 * Fetches product report data for a specific date range
 * @param startDate The start date for the report (format: YYYY-MM-DD)
 * @param endDate The end date for the report (format: YYYY-MM-DD)
 * @returns Promise resolving to product report data
 */
export async function getProductReport(
  startDate?: string,
  endDate?: string,
): Promise<ProductReportData> {
  const params = new URLSearchParams();
  if (startDate !== undefined) params.append("startDate", startDate);
  if (endDate !== undefined) params.append("endDate", endDate);

  const queryString = params.toString();
  const url = queryString
    ? `/api/reports/product?${queryString}`
    : "/api/reports/product";

  const response = await fetch(url);

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to fetch product report");
  }

  const result = await response.json();
  return result.data as ProductReportData;
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
