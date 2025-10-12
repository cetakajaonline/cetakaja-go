// src/routes/api/reports/export/+server.ts
import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { generateReport } from "$lib/server/reportService";
import { reportFilterSchema } from "$lib/validations/reportSchema";
import { verifyJwt } from "$lib/server/jwt";

// This is a simplified export implementation
// In a real application, you'd generate actual PDF, Excel, or CSV files
export const POST: RequestHandler = async ({ request, url, locals }) => {
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

    const format = url.searchParams.get('format') || 'pdf';
    if (!['pdf', 'xlsx', 'csv'].includes(format)) {
      return json({ success: false, message: "Invalid format" }, { status: 400 });
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
    
    // In a real implementation, you would generate the actual file content
    // For this example, we'll return basic content indicating the export
    let content: string;
    let contentType: string;
    
    switch (format) {
      case 'pdf':
        content = `Exported ${report.reportType} report from ${report.dateRange.start} to ${report.dateRange.end}`;
        contentType = 'application/pdf';
        break;
      case 'xlsx':
        content = `Exported ${report.reportType} report\nStart: ${report.dateRange.start}\nEnd: ${report.dateRange.end}\nRevenue: ${report.summary.revenue}\nExpenses: ${report.summary.expenses}\nNet: ${report.summary.net}`;
        contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        break;
      case 'csv':
        content = `Report Type,Start Date,End Date,Total,Revenue,Expenses,Net\n${report.reportType},${report.dateRange.start},${report.dateRange.end},${report.summary.total},${report.summary.revenue},${report.summary.expenses},${report.summary.net}`;
        contentType = 'text/csv';
        break;
      default:
        return json({ success: false, message: "Invalid format" }, { status: 400 });
    }

    // Return the file content
    return new Response(content, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="report-${new Date().toISOString().split('T')[0]}.${format}"`,
      }
    });
  } catch (error) {
    console.error("Error exporting report:", error);
    return json({ 
      success: false, 
      message: "Internal server error", 
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
};