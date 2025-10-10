import { json } from "@sveltejs/kit";
import {
  updateCategory,
  deleteCategory,
  getCategoryById,
} from "$lib/server/categoryService";
import { requireAdmin } from "$lib/server/auth";
import type { RequestHandler } from "./$types";
import { categoryUpdateSchema } from "$lib/validations/categorySchema";

// PUT: update category by ID (hanya admin yang bisa)
export const PUT: RequestHandler = async (event) => {
  const id = Number(event.params.id);
  const body = await event.request.json();

  requireAdmin(event); // Hanya admin yang bisa update

  const parsed = categoryUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return json(
      {
        message: "Validasi gagal",
        errors: parsed.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }

  try {
    const updated = await updateCategory(id, parsed.data);
    return json(updated);
  } catch (err) {
    return json(
      {
        message:
          err instanceof Error ? err.message : "Gagal mengupdate kategori",
      },
      { status: 500 },
    );
  }
};

// DELETE: hanya admin yang bisa hapus kategori
export const DELETE: RequestHandler = async (event) => {
  requireAdmin(event);

  const id = Number(event.params.id);
  try {
    await deleteCategory(id);
    return json({ success: true });
  } catch (err) {
    return json(
      {
        message:
          err instanceof Error ? err.message : "Gagal menghapus kategori",
      },
      { status: 500 },
    );
  }
};

// GET: ambil data kategori tertentu (admin saja)
export const GET: RequestHandler = async (event) => {
  const id = Number(event.params.id);
  requireAdmin(event); // Hanya admin bisa lihat detail kategori

  try {
    const category = await getCategoryById(id);
    if (!category) {
      return json({ message: "Kategori tidak ditemukan" }, { status: 404 });
    }
    return json(category);
  } catch {
    return json({ message: "Gagal mengambil data kategori" }, { status: 500 });
  }
};
