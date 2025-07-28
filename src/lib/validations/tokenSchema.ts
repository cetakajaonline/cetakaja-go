import { z } from "zod";

export const tokenSchema = z.object({
    name: z.string().min(1, "Nama token wajib diisi"),
    token: z.string().min(1, "Token tidak boleh kosong"),
    createdBy: z.number(), // akan diisi server
});

export const tokenUpdateSchema = z.object({
    name: z.string().min(1, "Nama token wajib diisi").optional(),
    revoked: z.boolean().optional(),
});

export type TokenFormSchema = z.infer<typeof tokenSchema>;
export type TokenUpdateSchema = z.infer<typeof tokenUpdateSchema>;
