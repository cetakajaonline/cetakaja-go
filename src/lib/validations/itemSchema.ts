// src/lib/validations/itemSchema.ts
import { z } from "zod";

export const itemSchema = z.object({
    name: z.string().min(1, "Nama item wajib diisi"),
    desc: z.string().min(1, "Deskripsi item wajib diisi"),
});

export type ItemFormSchema = z.infer<typeof itemSchema>;
