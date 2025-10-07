import { json } from "@sveltejs/kit";
import { updateProduct, deleteProduct, getProductById } from "$lib/server/productService";
import { requireAdmin } from "$lib/server/auth";
import type { RequestHandler } from "./$types";
import { productUpdateSchema } from "$lib/validations/productSchema";

// PUT: update product by ID (hanya admin yang bisa)
export const PUT: RequestHandler = async (event) => {
  const id = Number(event.params.id);
  const body = await event.request.json();

  requireAdmin(event); // Hanya admin yang bisa update

  const parsed = productUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return json(
      {
        message: "Validasi gagal",
        errors: parsed.error.flatten().fieldErrors,
      },
      { status: 400 }
    );
  }

  try {
    const updated = await updateProduct(id, parsed.data);
    return json(updated);
  } catch (err) {
    console.error(err);
    return json({ message: err instanceof Error ? err.message : "Gagal mengupdate produk" }, { status: 500 });
  }
};

// DELETE: hanya admin yang bisa hapus produk
export const DELETE: RequestHandler = async (event) => {
  requireAdmin(event);

  const id = Number(event.params.id);
  try {
    await deleteProduct(id);
    return json({ success: true });
  } catch (err) {
    console.error(err);
    return json({ message: err instanceof Error ? err.message : "Gagal menghapus produk" }, { status: 500 });
  }
};

// GET: ambil data produk tertentu (admin saja)
export const GET: RequestHandler = async (event) => {
  const id = Number(event.params.id);
  requireAdmin(event); // Hanya admin bisa lihat detail produk

  try {
    const product = await getProductById(id);
    if (!product) {
      return json({ message: "Produk tidak ditemukan" }, { status: 404 });
    }
    return json(product);
  } catch (err) {
    console.error(err);
    return json({ message: "Gagal mengambil data produk" }, { status: 500 });
  }
};