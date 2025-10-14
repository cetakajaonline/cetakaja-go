import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { getExpenseReport, getExpenseReportForDateRange } from "$lib/server/reportService";
import { z } from "zod";

// GET /api/reports/expense
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

      // Get expense report for date range
      report = await getExpenseReportForDateRange(startDate, endDate);
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

      // Get expense report for single date
      report = await getExpenseReport(targetDate);
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

      // Get expense report for date range
      report = await getExpenseReportForDateRange(startDate, endDate);
    }

    return json({
      success: true,
      message: "Expense report retrieved successfully",
      data: report,
    });
  } catch (error) {
    console.error("Error fetching expense report:", error);
    return json(
      { success: false, message: "Failed to fetch expense report" },
      { status: 500 },
    );
  }
};