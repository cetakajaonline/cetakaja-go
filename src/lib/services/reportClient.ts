// src/lib/services/reportClient.ts
import type {
  ReportFilter,
  ReportResponse,
  DailyReport,
  WeeklyReport,
  MonthlyReport,
  AnnualReport,
  ProductPerformanceReport,
  CustomerReport,
  RevenueReport,
  ExpenseReport,
} from "$lib/types";

// Define types for report generation
type GenerateReportRequest = ReportFilter;

export async function generateReport(
  filter: GenerateReportRequest,
): Promise<ReportResponse> {
  const response = await fetch("/api/reports/generate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(filter),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to generate report");
  }

  const result: ReportResponse = await response.json();
  return result;
}

export async function exportReport(
  filter: GenerateReportRequest,
  format: "pdf" | "xlsx" | "csv" = "pdf",
): Promise<Blob> {
  const response = await fetch(`/api/reports/export?format=${format}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(filter),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to export report");
  }

  return await response.blob();
}

// Specific report functions for convenience
export async function getDailyReport(date: Date): Promise<DailyReport> {
  const filter: ReportFilter = {
    startDate: date,
    endDate: date,
    reportType: "daily",
  };

  const response = await generateReport(filter);
  return response.data as DailyReport;
}

export async function getWeeklyReport(startDate: Date): Promise<WeeklyReport> {
  const filter: ReportFilter = {
    startDate,
    endDate: new Date(startDate.getTime() + 6 * 24 * 60 * 60 * 1000), // Add 6 days
    reportType: "weekly",
  };

  const response = await generateReport(filter);
  return response.data as WeeklyReport;
}

export async function getMonthlyReport(date: Date): Promise<MonthlyReport> {
  // Create start date as first day of month
  const startDate = new Date(date.getFullYear(), date.getMonth(), 1);
  // Create end date as last day of month
  const endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0);

  const filter: ReportFilter = {
    startDate,
    endDate,
    reportType: "monthly",
  };

  const response = await generateReport(filter);
  return response.data as MonthlyReport;
}

export async function getAnnualReport(year: number): Promise<AnnualReport> {
  const startDate = new Date(year, 0, 1);
  const endDate = new Date(year, 11, 31);

  const filter: ReportFilter = {
    startDate,
    endDate,
    reportType: "annual",
  };

  const response = await generateReport(filter);
  return response.data as AnnualReport;
}

export async function getProductPerformanceReport(
  productId: number,
  startDate: Date,
  endDate: Date,
): Promise<ProductPerformanceReport> {
  const filter: ReportFilter = {
    startDate,
    endDate,
    reportType: "product",
    productId,
  };

  const response = await generateReport(filter);
  // Type guard to ensure we're getting the right type
  if (Array.isArray(response.data)) {
    // If the API returns an array, return the first element
    if (response.data.length > 0) {
      return response.data[0] as ProductPerformanceReport;
    } else {
      throw new Error("No product performance data found");
    }
  } else {
    // Use unknown first to properly convert between non-overlapping types
    return response.data as unknown as ProductPerformanceReport;
  }
}

export async function getCustomerReport(
  userId: number,
  startDate: Date,
  endDate: Date,
): Promise<CustomerReport> {
  const filter: ReportFilter = {
    startDate,
    endDate,
    reportType: "customer",
    userId,
  };

  const response = await generateReport(filter);
  // Type guard to ensure we're getting the right type
  if (Array.isArray(response.data)) {
    // If the API returns an array, return the first element
    if (response.data.length > 0) {
      return response.data[0] as CustomerReport;
    } else {
      throw new Error("No customer data found");
    }
  } else {
    // Use unknown first to properly convert between non-overlapping types
    return response.data as unknown as CustomerReport;
  }
}

export async function getRevenueReport(
  startDate: Date,
  endDate: Date,
): Promise<RevenueReport> {
  const filter: ReportFilter = {
    startDate,
    endDate,
    reportType: "revenue",
  };

  const response = await generateReport(filter);
  // Type guard to ensure we're getting the right type
  if (Array.isArray(response.data)) {
    // If the API returns an array, return the first element
    if (response.data.length > 0) {
      return response.data[0] as RevenueReport;
    } else {
      throw new Error("No revenue data found");
    }
  } else {
    // Use unknown first to properly convert between non-overlapping types
    return response.data as unknown as RevenueReport;
  }
}

export async function getExpenseReport(
  startDate: Date,
  endDate: Date,
): Promise<ExpenseReport> {
  const filter: ReportFilter = {
    startDate,
    endDate,
    reportType: "expense",
  };

  const response = await generateReport(filter);
  // Type guard to ensure we're getting the right type
  if (Array.isArray(response.data)) {
    // If the API returns an array, return the first element
    if (response.data.length > 0) {
      return response.data[0] as ExpenseReport;
    } else {
      throw new Error("No expense data found");
    }
  } else {
    // Use unknown first to properly convert between non-overlapping types
    return response.data as unknown as ExpenseReport;
  }
}

// Additional functions for reports without specific IDs
export async function getAllProductsPerformanceReport(
  startDate: Date,
  endDate: Date,
): Promise<ProductPerformanceReport[]> {
  const filter: ReportFilter = {
    startDate,
    endDate,
    reportType: "product", // Will be handled as all products when no productId provided
  };

  const response = await generateReport(filter);
  return response.data as ProductPerformanceReport[];
}

export async function getAllCustomersReport(
  startDate: Date,
  endDate: Date,
): Promise<CustomerReport[]> {
  const filter: ReportFilter = {
    startDate,
    endDate,
    reportType: "customer", // Will be handled as all customers when no userId provided
  };

  const response = await generateReport(filter);
  return response.data as CustomerReport[];
}
