// src/routes/api/products/+server.ts
import { json } from "@sveltejs/kit";
import { requireAdmin } from "$lib/server/auth";
import {
  getAllProducts,
  createProduct,
  getProductByBaseCode,
} from "$lib/server/productService";
import type { RequestHandler } from "./$types";
import { productSchema } from "$lib/validations/productSchema";

// GET: hanya admin yang boleh akses
export const GET: RequestHandler = async (event) => {
  requireAdmin(event);
  const products = await getAllProducts();
  return json(products);
};

// POST: hanya admin yang boleh buat produk baru
export const POST: RequestHandler = async (event) => {
  requireAdmin(event);

  const body = await event.request.json();

  // ✅ Validasi Zod
  const parsed = productSchema.safeParse(body);
  if (!parsed.success) {
    return json(
      {
        message: "Validasi gagal",
        errors: parsed.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }

  const data = parsed.data;

  const existing = await getProductByBaseCode(data.baseCode, data.categoryId);
  if (existing) {
    return json(
      { message: "Kode produk sudah terdaftar dalam kategori ini" },
      { status: 400 },
    );
  }

  try {
    const newProduct = await createProduct({
      name: data.name,
      description: data.description,
      baseCode: data.baseCode,
      photo: data.photo || undefined, // ubah "" menjadi undefined jika null/empty
      categoryId: data.categoryId,
      variants: data.variants,
    });
    return json(newProduct);
  } catch (err) {
    console.error(err);
    return json({ message: "Gagal membuat produk" }, { status: 500 });
  }
};
