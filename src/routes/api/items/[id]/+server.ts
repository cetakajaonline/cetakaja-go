import { json } from "@sveltejs/kit";
import {
  updateItem,
  deleteItem,
  getItemById,
} from "$lib/server/itemService";
import { requireAnyRole } from "$lib/server/auth";
import type { RequestHandler } from "./$types";
import { itemSchema } from "$lib/validations/itemSchema";

// GET /api/items/:id
export const GET: RequestHandler = async (event) => {
  requireAnyRole(event);

  const id = Number(event.params.id);
  if (isNaN(id)) throw new Error("ID item tidak valid");

  const item = await getItemById(id);
  if (!item) throw new Error("Item tidak ditemukan");

  return json(item);
};

// PUT /api/items/:id
export const PUT: RequestHandler = async (event) => {
  requireAnyRole(event);

  const id = Number(event.params.id);
  if (isNaN(id)) throw new Error("ID item tidak valid");

  const body = await event.request.json();
  const parsed = itemSchema.safeParse(body);

  if (!parsed.success) {
    return json(
      {
        message: "Validasi gagal",
        errors: parsed.error.flatten().fieldErrors,
      },
      { status: 400 }
    );
  }

  const existing = await getItemById(id);
  if (!existing) throw new Error("Item tidak ditemukan");

  const updated = await updateItem(id, parsed.data);
  return json(updated);
};

// DELETE /api/items/:id
export const DELETE: RequestHandler = async (event) => {
  requireAnyRole(event);

  const id = Number(event.params.id);
  if (isNaN(id)) throw new Error("ID item tidak valid");

  const existing = await getItemById(id);
  if (!existing) throw new Error("Item tidak ditemukan");

  await deleteItem(id);
  return json({ success: true });
};
