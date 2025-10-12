// src/routes/api/reports/generate/+server.ts
import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { generateReport } from "$lib/server/reportService";
import { reportFilterSchema } from "$lib/validations/reportSchema";
import { verifyJwt } from "$lib/server/jwt";

export const POST: RequestHandler = async ({ request, locals }) => {
  try {
    // Check authentication
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    if (!token && !locals.user) {
      return json({ success: false, message: "Unauthorized" }, { status: 401 });
    }
    
    // Verify token if provided in header
    if (token) {
      const decoded = verifyJwt<{ userId: number; role: string }>(token);
      if (!decoded) {
        return json({ success: false, message: "Invalid token" }, { status: 401 });
      }
    }
    
    // Check user role (only admin and staff can access reports)
    if (locals.user && !["admin", "staff"].includes(locals.user.role)) {
      return json({ success: false, message: "Insufficient permissions" }, { status: 403 });
    }

    const body = await request.json();
    
    // Validate input
    const validationResult = reportFilterSchema.safeParse(body);
    if (!validationResult.success) {
      return json({ 
        success: false, 
        message: "Validation error", 
        error: validationResult.error.issues 
      }, { status: 400 });
    }
    
    // Parse string dates to Date objects
    const filter = {
      ...validationResult.data,
      startDate: validationResult.data.startDate ? new Date(validationResult.data.startDate) : undefined,
      endDate: validationResult.data.endDate ? new Date(validationResult.data.endDate) : undefined,
    };
    
    // Generate report
    const report = await generateReport(filter);
    
    return json({ 
      success: true, 
      message: "Report generated successfully", 
      data: report 
    });
  } catch (error) {
    console.error("Error generating report:", error);
    return json({ 
      success: false, 
      message: "Internal server error", 
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
};