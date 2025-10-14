import { error } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { getWeeklyReport as getWeeklyReportService } from "$lib/server/reportService";
import { z } from "zod";

/**
 * Loads weekly report data for the specified start date.
 * If no start date is provided in the URL, defaults to the start of the current week.
 *
 * @param url - The URL object containing query parameters
 * @returns Object containing weekly report data
 */
export const load: PageServerLoad = async ({ url }) => {
  try {
    // Parse startDate from URL query parameter, default to start of current week
    const startDateParam = url.searchParams.get("startDate");
    let targetStartDate: Date;

    if (startDateParam) {
      const parsedDate = z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/)
        .safeParse(startDateParam);
      if (!parsedDate.success) {
        throw error(400, "Invalid date format. Use YYYY-MM-DD");
      }

      // Parse the date string without time to avoid timezone issues
      const [year, month, day] = parsedDate.data.split("-").map(Number);
      targetStartDate = new Date(year, month - 1, day, 0, 0, 0, 0); // month is 0-indexed
    } else {
      // Default to the start of the current week (Monday) in local timezone
      const today = new Date();
      const dayOfWeek = today.getDay(); // 0 (Sunday) to 6 (Saturday)
      // Calculate how many days to subtract to get to Monday
      const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // If Sunday, subtract 6; otherwise subtract (dayOfWeek - 1)

      targetStartDate = new Date(today);
      targetStartDate.setDate(today.getDate() - daysToSubtract);
      targetStartDate.setHours(0, 0, 0, 0);
    }

    // Calculate end date (end of the week - Sunday)
    const targetEndDate = new Date(targetStartDate);
    targetEndDate.setDate(targetStartDate.getDate() + 6);
    targetEndDate.setHours(23, 59, 59, 999);

    // Get weekly report data using the service
    const reportData = await getWeeklyReportService(
      targetStartDate,
      targetEndDate,
    );

    // Return the weekly report data
    return {
      reportData,
    };
  } catch (err) {
    console.error("Error fetching weekly report:", err);
    throw error(500, "Failed to fetch weekly report");
  }
};
