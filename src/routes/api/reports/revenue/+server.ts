import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { getRevenueReport } from "$lib/server/reportService";
import { z } from "zod";

// GET /api/reports/revenue
export const GET: RequestHandler = async ({ url }) => {
  try {
    // Parse date from query parameter, default to today
    const dateParam = url.searchParams.get("date");
    let targetDate: Date;

    if (dateParam) {
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
      targetDate = new Date(`${parsedDate.data}T00:00:00`);
    } else {
      // Default to today's date
      targetDate = new Date();
      targetDate.setHours(0, 0, 0, 0);
    }

    // Get revenue report data
    const report = await getRevenueReport(targetDate);

    return json({
      success: true,
      message: "Revenue report retrieved successfully",
      data: report,
    });
  } catch (error) {
    console.error("Error fetching revenue report:", error);
    return json(
      { success: false, message: "Failed to fetch revenue report" },
      { status: 500 },
    );
  }
};