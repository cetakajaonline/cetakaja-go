import { error } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { getMarginReport } from "$lib/server/reportService";
import { z } from "zod";

/**
 * Loads margin report data for the specified date.
 * If no date is provided in the URL, defaults to the current day.
 *
 * @param url - The URL object containing query parameters
 * @returns Object containing margin report data
 */
export const load: PageServerLoad = async ({ url }) => {
  try {
    // Parse date from URL query parameter, default to today
    const dateParam = url.searchParams.get("date");
    let targetDate: Date;

    if (dateParam) {
      const parsedDate = z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/)
        .safeParse(dateParam);
      if (!parsedDate.success) {
        throw error(400, "Invalid date format. Use YYYY-MM-DD");
      }

      // Parse the date string without time to avoid timezone issues
      const [year, month, day] = parsedDate.data.split("-").map(Number);
      targetDate = new Date(year, month - 1, day, 0, 0, 0, 0); // month is 0-indexed
    } else {
      // Default to today's date in local timezone
      const today = new Date();
      targetDate = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate(),
        0,
        0,
        0,
        0,
      );
    }

    // Get margin report data using the service
    const reportData = await getMarginReport(targetDate);

    // Return the margin report data
    return {
      reportData,
    };
  } catch (err) {
    console.error("Error fetching margin report:", err);
    throw error(500, "Failed to fetch margin report");
  }
};