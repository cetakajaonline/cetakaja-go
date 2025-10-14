import { error } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { getAnnualReport as getAnnualReportService } from "$lib/server/reportService";
import { z } from "zod";

/**
 * Loads annual report data for the specified year.
 * If no year is provided in the URL, defaults to the current year.
 *
 * @param url - The URL object containing query parameters
 * @returns Object containing annual report data
 */
export const load: PageServerLoad = async ({ url }) => {
  try {
    // Parse year from URL query parameters, default to current year
    const yearParam = url.searchParams.get("year");

    let targetYear: number;

    if (yearParam) {
      const parsedYear = z
        .string()
        .regex(/^\d{4}$/)
        .safeParse(yearParam);

      if (!parsedYear.success) {
        throw error(400, "Invalid year format. Use YYYY for year");
      }

      targetYear = parseInt(parsedYear.data);
    } else {
      // Default to current year
      targetYear = new Date().getFullYear();
    }

    // Get annual report data using the service
    const reportData = await getAnnualReportService(targetYear);

    // Return the annual report data
    return {
      reportData,
    };
  } catch (err) {
    console.error("Error fetching annual report:", err);
    throw error(500, "Failed to fetch annual report");
  }
};
