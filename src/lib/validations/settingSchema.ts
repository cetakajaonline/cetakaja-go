import { z } from "zod";

export const settingSchema = z.object({
  name: z.string().min(1, "Nama aplikasi wajib diisi"),
  description: z.string().min(1, "Deskripsi wajib diisi"),
});
