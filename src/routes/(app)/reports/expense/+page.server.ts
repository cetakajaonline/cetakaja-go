import { error } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { getExpenseReport, getExpenseReportForDateRange } from "$lib/server/reportService";
import { z } from "zod";

/**
 * Loads expense report data for the specified date or date range.
 * If no date is provided in the URL, defaults to the current week.
 *
 * @param url - The URL object containing query parameters
 * @returns Object containing expense report data
 */
export const load: PageServerLoad = async ({ url }) => {
  try {
    // Parse startDate and endDate from query parameters, default to current week
    const dateParam = url.searchParams.get("date");
    const startDateParam = url.searchParams.get("startDate");
    const endDateParam = url.searchParams.get("endDate");

    let reportData;

    if (startDateParam && endDateParam) {
      // Date range query - parse start and end dates
      const parsedStartDate = z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/)
        .safeParse(startDateParam);
      const parsedEndDate = z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/)
        .safeParse(endDateParam);

      if (!parsedStartDate.success || !parsedEndDate.success) {
        throw error(400, "Invalid date format. Use YYYY-MM-DD");
      }

      // Parse the date strings without time to avoid timezone issues
      const [startYear, startMonth, startDay] = parsedStartDate.data.split("-").map(Number);
      const startDate = new Date(startYear, startMonth - 1, startDay, 0, 0, 0, 0); // month is 0-indexed

      const [endYear, endMonth, endDay] = parsedEndDate.data.split("-").map(Number);
      const endDate = new Date(endYear, endMonth - 1, endDay, 0, 0, 0, 0); // month is 0-indexed

      // Get expense report data for date range using the service
      reportData = await getExpenseReportForDateRange(startDate, endDate);
    } else if (dateParam) {
      // Single date query
      const parsedDate = z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/)
        .safeParse(dateParam);
      if (!parsedDate.success) {
        throw error(400, "Invalid date format. Use YYYY-MM-DD");
      }

      // Parse the date string without time to avoid timezone issues
      const [year, month, day] = parsedDate.data.split("-").map(Number);
      const targetDate = new Date(year, month - 1, day, 0, 0, 0, 0); // month is 0-indexed

      // Get expense report data for single date using the service
      reportData = await getExpenseReport(targetDate);
    } else {
      // Default to current week (Monday to Sunday) for date range
      const today = new Date();
      const dayOfWeek = today.getDay(); // 0 (Sunday) to 6 (Saturday)
      // Calculate how many days to subtract to get to Monday
      const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // If Sunday, subtract 6; otherwise subtract (dayOfWeek - 1)

      const startDate = new Date(today);
      startDate.setDate(today.getDate() - daysToSubtract);
      startDate.setHours(0, 0, 0, 0);

      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6);
      endDate.setHours(23, 59, 59, 999);

      // Get expense report data for date range using the service
      reportData = await getExpenseReportForDateRange(startDate, endDate);
    }

    // Return the expense report data
    return {
      reportData,
    };
  } catch (err) {
    console.error("Error fetching expense report:", err);
    throw error(500, "Failed to fetch expense report");
  }
};