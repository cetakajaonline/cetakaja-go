import { z } from "zod";

export const categorySchema = z.object({
  name: z.string().min(1, "Nama kategori wajib diisi"),
  code: z.string().min(1, "Kode kategori wajib diisi"),
  description: z.string().optional(),
});

export const categoryUpdateSchema = categorySchema
  .partial();

export type CategoryFormSchema = z.infer<typeof categorySchema>;
export type CategoryUpdateSchema = z.infer<typeof categoryUpdateSchema>;