import { z } from "zod";

export const userSchema = z.object({
  name: z.string().min(1, "Nama wajib diisi"),
  username: z.string().min(3, "Username minimal 3 karakter"),
  password: z.string().min(6, "Minimal 6 karakter"),
  phone: z
    .string()
    .regex(
      /^08\d{8,}$/,
      "Nomor telepon harus diawali dengan 08 dan hanya berisi angka",
    ),
  address: z.string().optional(),
  role: z.enum(["admin", "staff", "customer"]),
});

// Ubah password agar "" diperlakukan sebagai undefined
export const userUpdateSchema = userSchema.partial().extend({
  password: z.preprocess(
    (val) => (typeof val === "string" && val.trim() === "" ? undefined : val),
    z.string().min(6, "Minimal 6 karakter").optional(),
  ),
  phone: z
    .string()
    .regex(
      /^08\d{8,}$/,
      "Nomor telepon harus diawali dengan 08 dan hanya berisi angka",
    )
    .optional(),
});

export type UserFormSchema = z.infer<typeof userSchema>;
export type UserUpdateSchema = z.infer<typeof userUpdateSchema>;
