import { z } from "zod";

export const productVariantSchema = z.object({
  id: z.number().optional(),
  variantName: z.string().min(1, "Nama varian wajib diisi"),
  price: z.number().min(1, "Harga harus lebih besar dari 0"),
  delete: z.boolean().optional(),
});

export const productSchema = z.object({
  name: z.string().min(1, "Nama produk wajib diisi").max(150, "Nama produk terlalu panjang (maksimal 150 karakter)"),
  description: z.string().max(1000, "Deskripsi terlalu panjang (maksimal 1000 karakter)").optional(),
  baseCode: z.string().min(1, "Kode produk wajib diisi").max(50, "Kode produk terlalu panjang (maksimal 50 karakter)"),
  photo: z.string().max(255, "URL foto terlalu panjang (maksimal 255 karakter)").optional(),
  categoryId: z.number().min(1, "Kategori wajib dipilih"),
  variants: z.array(productVariantSchema).min(1, "Produk harus memiliki setidaknya satu varian"),
});

export const productUpdateSchema = z.object({
  name: z.string().min(1, "Nama produk wajib diisi").max(150, "Nama produk terlalu panjang (maksimal 150 karakter)").optional(),
  description: z.string().max(1000, "Deskripsi terlalu panjang (maksimal 1000 karakter)").optional(),
  baseCode: z.string().min(1, "Kode produk wajib diisi").max(50, "Kode produk terlalu panjang (maksimal 50 karakter)").optional(),
  photo: z.string().max(255, "URL foto terlalu panjang (maksimal 255 karakter)").optional(),
  categoryId: z.number().min(1, "Kategori wajib dipilih").optional(),
  variants: z.array(productVariantSchema).optional(),
});

export type ProductFormSchema = z.infer<typeof productSchema>;
export type ProductUpdateSchema = z.infer<typeof productUpdateSchema>;
export type ProductVariantFormSchema = z.infer<typeof productVariantSchema>;