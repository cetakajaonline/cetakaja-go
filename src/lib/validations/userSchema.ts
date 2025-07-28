import { z } from 'zod'

export const userSchema = z.object({
    name: z.string().min(1, 'Nama wajib diisi'),
    email: z.string().email('Email tidak valid'),
    password: z.string().min(6, 'Minimal 6 karakter'),
    role: z.enum(['admin', 'user']),
    photo: z.union([z.string().url(), z.literal('')]).optional(),
})

export const userUpdateSchema = userSchema.partial();

export type UserFormSchema = z.infer<typeof userSchema>
export type UserUpdateSchema = z.infer<typeof userUpdateSchema>

