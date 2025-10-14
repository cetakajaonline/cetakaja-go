import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { getMarginReport, getMarginReportForDateRange } from "$lib/server/reportService";
import { z } from "zod";

// GET /api/reports/margin
export const GET: RequestHandler = async ({ url }) => {
  try {
    // Parse startDate and endDate from query parameters, default to current week
    const dateParam = url.searchParams.get("date");
    const startDateParam = url.searchParams.get("startDate");
    const endDateParam = url.searchParams.get("endDate");

    let report;

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
        return json(
          { success: false, message: "Invalid date format. Use YYYY-MM-DD" },
          { status: 400 },
        );
      }

      const startDate = new Date(`${parsedStartDate.data}T00:00:00`);
      const endDate = new Date(`${parsedEndDate.data}T23:59:59.999`);

      // Get margin report for date range
      report = await getMarginReportForDateRange(startDate, endDate);
    } else if (dateParam) {
      // Single date query
      const parsedDate = z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/)
        .safeParse(dateParam);
      if (!parsedDate.success) {
        return json(
          { success: false, message: "Invalid date format. Use YYYY-MM-DD" },
          { status: 400 },
        );
      }
      const targetDate = new Date(`${parsedDate.data}T00:00:00`);

      // Get margin report for single date
      report = await getMarginReport(targetDate);
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

      // Get margin report for date range
      report = await getMarginReportForDateRange(startDate, endDate);
    }

    return json({
      success: true,
      message: "Margin report retrieved successfully",
      data: report,
    });
  } catch (error) {
    console.error("Error fetching margin report:", error);
    return json(
      { success: false, message: "Failed to fetch margin report" },
      { status: 500 },
    );
  }
};