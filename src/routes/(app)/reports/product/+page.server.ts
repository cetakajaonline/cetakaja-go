import { error } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { getProductReport as getProductReportService } from "$lib/server/reportService";
import { z } from "zod";

/**
 * Loads product report data for the specified date range.
 * If no date range is provided in the URL, defaults to the current week.
 *
 * @param url - The URL object containing query parameters
 * @returns Object containing product report data
 */
export const load: PageServerLoad = async ({ url }) => {
  try {
    // Parse startDate and endDate from URL query parameters, default to current week
    const startDateParam = url.searchParams.get("startDate");
    const endDateParam = url.searchParams.get("endDate");

    let startDate: Date;
    let endDate: Date;

    if (startDateParam && endDateParam) {
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

      startDate = new Date(`${parsedStartDate.data}T00:00:00`);
      endDate = new Date(`${parsedEndDate.data}T23:59:59.999`);
    } else {
      // Default to current week (Monday to Sunday)
      const today = new Date();
      const dayOfWeek = today.getDay(); // 0 (Sunday) to 6 (Saturday)
      // Calculate how many days to subtract to get to Monday
      const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // If Sunday, subtract 6; otherwise subtract (dayOfWeek - 1)

      startDate = new Date(today);
      startDate.setDate(today.getDate() - daysToSubtract);
      startDate.setHours(0, 0, 0, 0);

      endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6);
      endDate.setHours(23, 59, 59, 999);
    }

    // Get product report data using the service
    const reportData = await getProductReportService(startDate, endDate);

    // Return the product report data
    return {
      reportData,
    };
  } catch (err) {
    console.error("Error fetching product report:", err);
    throw error(500, "Failed to fetch product report");
  }
};
