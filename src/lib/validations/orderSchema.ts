import { z } from "zod";

export const orderSchema = z.object({
  userId: z.number().min(1, "User wajib dipilih"),
  orderNumber: z.string().min(3, "Nomor order minimal 3 karakter").optional(),
  status: z.enum(["pending", "processing", "finished", "canceled"]),
  shippingMethod: z.enum(["pickup", "delivery"]),
  paymentMethod: z.enum(["transfer", "qris", "cash"]),
  paymentStatus: z
    .enum(["pending", "confirmed", "failed", "refunded"])
    .optional(),
  totalAmount: z
    .number()
    .min(0, "Total amount harus lebih dari atau sama dengan 0"),
  notes: z.string().max(500, "Catatan maksimal 500 karakter").optional(),
  createdById: z.number().optional(),
  orderItems: z
    .array(
      z.object({
        productId: z.number().min(1, "Produk wajib dipilih"),
        variantId: z.number().optional(),
        qty: z.number().min(1, "Jumlah minimal 1"),
        price: z.number().min(0, "Harga harus lebih dari atau sama dengan 0"),
        subtotal: z
          .number()
          .min(0, "Subtotal harus lebih dari atau sama dengan 0"),
      }),
    )
    .optional(),
});

export const orderUpdateSchema = orderSchema.partial().extend({
  orderNumber: z.string().min(3, "Nomor order minimal 3 karakter").optional(),
  notes: z.string().max(500, "Catatan maksimal 500 karakter").optional(),
});

export type OrderFormSchema = z.infer<typeof orderSchema>;
export type OrderUpdateSchema = z.infer<typeof orderUpdateSchema>;