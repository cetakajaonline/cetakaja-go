import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { getWeeklyReport } from "$lib/server/reportService";
import { z } from "zod";

// GET /api/reports/weekly
export const GET: RequestHandler = async ({ url }) => {
  try {
    // Parse startDate from query parameter, default to beginning of this week
    const startDateParam = url.searchParams.get("startDate");
    let targetStartDate: Date;

    if (startDateParam) {
      const parsedDate = z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/)
        .safeParse(startDateParam);
      if (!parsedDate.success) {
        return json(
          { success: false, message: "Invalid date format. Use YYYY-MM-DD" },
          { status: 400 },
        );
      }
      targetStartDate = new Date(`${parsedDate.data}T00:00:00`);
    } else {
      // Default to the start of the current week (Monday)
      targetStartDate = new Date();
      const day = targetStartDate.getDay();
      const diff = targetStartDate.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
      targetStartDate = new Date(targetStartDate.setDate(diff));
      targetStartDate.setHours(0, 0, 0, 0);
    }

    // Calculate end date (end of the week - Sunday)
    const targetEndDate = new Date(targetStartDate);
    targetEndDate.setDate(targetStartDate.getDate() + 6);
    targetEndDate.setHours(23, 59, 59, 999);

    // Get weekly report data
    const report = await getWeeklyReport(targetStartDate, targetEndDate);

    return json({
      success: true,
      message: "Weekly report retrieved successfully",
      data: report,
    });
  } catch (error) {
    console.error("Error fetching weekly report:", error);
    return json(
      { success: false, message: "Failed to fetch weekly report" },
      { status: 500 },
    );
  }
};
