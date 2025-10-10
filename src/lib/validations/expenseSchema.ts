import { z } from "zod";

export const expenseSchema = z.object({
  nominal: z.number().min(1, "Nominal harus lebih besar dari 0"),
  category: z.enum(["operasional", "marketing", "gaji", "lainnya"]),
  date: z.coerce.date(),
  description: z
    .string()
    .max(255, "Deskripsi maksimal 255 karakter")
    .optional()
    .nullable()
    .transform((val) => val ?? undefined), // Convert null to undefined to match the Expense type
  proofFile: z
    .instanceof(File, { message: "File bukti harus berupa file yang valid" })
    .optional()
    .nullable(),
});

export const expenseUpdateSchema = expenseSchema.partial().extend({
  description: z
    .string()
    .max(255, "Deskripsi maksimal 255 karakter")
    .optional()
    .nullable()
    .transform((val) => val ?? undefined), // Convert null to undefined to match the Expense type
  proofFile: z
    .instanceof(File, { message: "File bukti harus berupa file yang valid" })
    .optional()
    .nullable(),
});

export type ExpenseFormSchema = z.infer<typeof expenseSchema>;
export type ExpenseUpdateSchema = z.infer<typeof expenseUpdateSchema>;

