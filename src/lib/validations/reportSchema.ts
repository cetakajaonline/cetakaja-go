// src/lib/validations/reportSchema.ts
import { z } from "zod";

// Report filter schema
export const reportFilterSchema = z.object({
  startDate: z.string().datetime({ offset: true }).optional(),
  endDate: z.string().datetime({ offset: true }).optional(),
  reportType: z.enum(['daily', 'weekly', 'monthly', 'annual', 'product', 'customer', 'revenue', 'expense']),
  productId: z.number().optional(),
  userId: z.number().optional(),
});

export type ReportFilterSchema = z.infer<typeof reportFilterSchema>;

// Report date range schema
export const reportDateRangeSchema = z.object({
  startDate: z.string().datetime({ offset: true }),
  endDate: z.string().datetime({ offset: true }),
}).refine((data) => new Date(data.startDate) <= new Date(data.endDate), {
  message: "Start date must be before or equal to end date",
  path: ["startDate"]
});

export type ReportDateRangeSchema = z.infer<typeof reportDateRangeSchema>;

// Report generation request schema
export const generateReportSchema = z.object({
  type: z.enum(['daily', 'weekly', 'monthly', 'annual', 'product', 'customer', 'revenue', 'expense']),
  startDate: z.string().datetime({ offset: true }),
  endDate: z.string().datetime({ offset: true }).optional(),
  filters: z.record(z.string(), z.any()).optional(),
});

export type GenerateReportSchema = z.infer<typeof generateReportSchema>;