import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { getAnnualReport } from "$lib/server/reportService";
import { z } from "zod";

// GET /api/reports/annual
export const GET: RequestHandler = async ({ url }) => {
  try {
    // Parse year from query parameters, default to current year
    const yearParam = url.searchParams.get("year");

    let targetYear: number;

    if (yearParam) {
      const parsedYear = z
        .string()
        .regex(/^\d{4}$/)
        .safeParse(yearParam);

      if (!parsedYear.success) {
        return json(
          { success: false, message: "Invalid year format. Use YYYY for year" },
          { status: 400 },
        );
      }

      targetYear = parseInt(parsedYear.data);
    } else {
      // Default to current year
      targetYear = new Date().getFullYear();
    }

    // Get annual report data
    const report = await getAnnualReport(targetYear);

    return json({
      success: true,
      message: "Annual report retrieved successfully",
      data: report,
    });
  } catch (error) {
    console.error("Error fetching annual report:", error);
    return json(
      { success: false, message: "Failed to fetch annual report" },
      { status: 500 },
    );
  }
};
