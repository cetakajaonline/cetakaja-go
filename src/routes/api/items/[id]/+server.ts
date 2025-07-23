import { json, error } from "@sveltejs/kit";
import { updateItem, deleteItem, getItemById } from "$lib/server/itemService";
import { requireAnyRole } from "$lib/server/auth";
import type { RequestHandler } from "./$types";

// GET /api/items/:id
export const GET: RequestHandler = async (event) => {
  requireAnyRole(event);

  const id = Number(event.params.id);
  if (isNaN(id)) throw error(400, "Invalid item ID");

  const item = await getItemById(id);
  if (!item) throw error(404, "Item not found");

  return json(item);
};

// PUT /api/items/:id
export const PUT: RequestHandler = async (event) => {
  requireAnyRole(event);

  const id = Number(event.params.id);
  if (isNaN(id)) throw error(400, "Invalid item ID");

  const body = (await event.request.json()) as { name?: string; desc?: string };

  if (!body.name?.trim() || !body.desc?.trim()) {
    throw error(400, "Name and description are required");
  }

  const existing = await getItemById(id);
  if (!existing) throw error(404, "Item not found");

  const updated = await updateItem(id, {
    name: body.name,
    desc: body.desc,
  });

  return json(updated, { status: 200 });
};

// DELETE /api/items/:id
export const DELETE: RequestHandler = async (event) => {
  requireAnyRole(event);

  const id = Number(event.params.id);
  if (isNaN(id)) throw error(400, "Invalid item ID");

  const existing = await getItemById(id);
  if (!existing) throw error(404, "Item not found");

  await deleteItem(id);

  return json({ success: true }, { status: 200 });
};
