import { z } from "zod";

export const settingSchema = z.object({
  name: z.string().min(1, "Nama aplikasi wajib diisi"),
  description: z.string().min(1, "Deskripsi wajib diisi"),
  bankName: z.string().optional(),
  bankCode: z.string().optional(),
  bankAccountNumber: z.string().optional(),
  bankAccountName: z.string().optional(),
});
