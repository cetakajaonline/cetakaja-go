// src/routes/api/categories/+server.ts
import { json } from "@sveltejs/kit";
import { requireAdmin } from "$lib/server/auth";
import {
  getAllCategories,
  createCategory,
  getCategoryByCode,
} from "$lib/server/categoryService";
import type { RequestHandler } from "./$types";
import { categorySchema } from "$lib/validations/categorySchema";

// GET: hanya admin yang boleh akses
export const GET: RequestHandler = async (event) => {
  requireAdmin(event);
  const categories = await getAllCategories();
  return json(categories);
};

// POST: hanya admin yang boleh buat kategori baru
export const POST: RequestHandler = async (event) => {
  requireAdmin(event);

  const body = await event.request.json();

  // ✅ Validasi Zod
  const parsed = categorySchema.safeParse(body);
  if (!parsed.success) {
    return json(
      {
        message: "Validasi gagal",
        errors: parsed.error.flatten().fieldErrors,
      },
      { status: 400 }
    );
  }

  const data = parsed.data;

  const existing = await getCategoryByCode(data.code);
  if (existing) {
    return json({ message: "Kode kategori sudah terdaftar" }, { status: 400 });
  }

  try {
    const newCategory = await createCategory({
      name: data.name,
      code: data.code,
      description: data.description,
    });
    return json(newCategory);
  } catch (err) {
    console.error(err);
    return json({ message: "Gagal membuat kategori" }, { status: 500 });
  }
};