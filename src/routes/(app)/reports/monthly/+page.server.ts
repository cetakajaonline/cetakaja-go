import { error } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { getMonthlyReport as getMonthlyReportService } from "$lib/server/reportService";
import { z } from "zod";

/**
 * Loads monthly report data for the specified month.
 * If no month is provided in the URL, defaults to the current month.
 *
 * @param url - The URL object containing query parameters
 * @returns Object containing monthly report data
 */
export const load: PageServerLoad = async ({ url }) => {
  try {
    // Parse year and month from URL query parameters, default to current month
    const yearParam = url.searchParams.get("year");
    const monthParam = url.searchParams.get("month");

    let targetYear: number;
    let targetMonth: number;

    if (yearParam && monthParam) {
      const parsedYear = z
        .string()
        .regex(/^\d{4}$/)
        .safeParse(yearParam);
      const parsedMonth = z
        .string()
        .regex(/^\d{1,2}$/)
        .safeParse(monthParam);

      if (!parsedYear.success || !parsedMonth.success) {
        throw error(
          400,
          "Invalid year or month format. Use YYYY for year and MM for month",
        );
      }

      targetYear = parseInt(parsedYear.data);
      targetMonth = parseInt(parsedMonth.data);

      // Validate month range
      if (targetMonth < 1 || targetMonth > 12) {
        throw error(400, "Invalid month. Month must be between 1 and 12");
      }
    } else {
      // Default to current month
      const today = new Date();
      targetYear = today.getFullYear();
      targetMonth = today.getMonth() + 1; // month is 0-indexed
    }

    // Get monthly report data using the service
    const reportData = await getMonthlyReportService(targetYear, targetMonth);

    // Return the monthly report data
    return {
      reportData,
    };
  } catch (err) {
    console.error("Error fetching monthly report:", err);
    throw error(500, "Failed to fetch monthly report");
  }
};
