import { z } from "zod";

export const loginSchema = z.object({
  username: z
    .string()
    .min(3, "Username atau No. Telp minimal 3 karakter")
    .max(15, "Username atau No. Telp maksimal 15 karakter"),
  password: z.string().min(6, "Password minimal 6 karakter"),
});

export const registerSchema = z.object({
  name: z.string().min(1, "Nama wajib diisi"),
  username: z.string().min(3, "Username minimal 3 karakter"),
  phone: z
    .string()
    .min(10)
    .max(15)
    .regex(
      /^08\d+$/,
      "Nomor telepon harus diawali dengan 08 dan hanya berisi angka",
    ),
  password: z.string().min(6, "Password minimal 6 karakter"),
});
