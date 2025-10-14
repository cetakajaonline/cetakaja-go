import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { getMonthlyReport } from "$lib/server/reportService";
import { z } from "zod";

// GET /api/reports/monthly
export const GET: RequestHandler = async ({ url }) => {
  try {
    // Parse year and month from query parameters, default to current month
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
        return json(
          {
            success: false,
            message:
              "Invalid year or month format. Use YYYY for year and MM for month",
          },
          { status: 400 },
        );
      }

      targetYear = parseInt(parsedYear.data);
      targetMonth = parseInt(parsedMonth.data);

      // Validate month range
      if (targetMonth < 1 || targetMonth > 12) {
        return json(
          {
            success: false,
            message: "Invalid month. Month must be between 1 and 12",
          },
          { status: 400 },
        );
      }
    } else {
      // Default to current month
      const today = new Date();
      targetYear = today.getFullYear();
      targetMonth = today.getMonth() + 1; // month is 0-indexed
    }

    // Get monthly report data
    const report = await getMonthlyReport(targetYear, targetMonth);

    return json({
      success: true,
      message: "Monthly report retrieved successfully",
      data: report,
    });
  } catch (error) {
    console.error("Error fetching monthly report:", error);
    return json(
      { success: false, message: "Failed to fetch monthly report" },
      { status: 500 },
    );
  }
};
