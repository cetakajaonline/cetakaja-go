import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { getProductReport } from "$lib/server/reportService";
import { z } from "zod";

// GET /api/reports/product
export const GET: RequestHandler = async ({ url }) => {
  try {
    // Parse startDate and endDate from query parameters, default to current week
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
        return json(
          { success: false, message: "Invalid date format. Use YYYY-MM-DD" },
          { status: 400 },
        );
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

    // Get product report data
    const report = await getProductReport(startDate, endDate);

    return json({
      success: true,
      message: "Product report retrieved successfully",
      data: report,
    });
  } catch (error) {
    console.error("Error fetching product report:", error);
    return json(
      { success: false, message: "Failed to fetch product report" },
      { status: 500 },
    );
  }
};
