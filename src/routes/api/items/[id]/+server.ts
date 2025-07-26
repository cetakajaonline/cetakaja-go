import { json } from "@sveltejs/kit";
import { updateItem, deleteItem, getItemById } from "$lib/server/itemService";
import { requireAnyRole } from "$lib/server/auth";
import type { RequestHandler } from "./$types";

// GET /api/items/:id
export const GET: RequestHandler = async (event) => {
  requireAnyRole(event);

  const id = Number(event.params.id);
  if (isNaN(id)) throw new Error("Invalid item ID");

  const item = await getItemById(id);
  if (!item) throw new Error("Item not found");

  return json(item);
};

// PUT /api/items/:id
export const PUT: RequestHandler = async (event) => {
  requireAnyRole(event);

  const id = Number(event.params.id);
  if (isNaN(id)) throw new Error("Invalid item ID");

  const body = (await event.request.json()) as { name?: string; desc?: string };

  if (!body.name?.trim() || !body.desc?.trim()) {
    throw new Error("Name and description are required");
  }

  const existing = await getItemById(id);
  if (!existing) throw new Error("Item not found");

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
  if (isNaN(id)) throw new Error("Invalid item ID");

  const existing = await getItemById(id);
  if (!existing) throw new Error("Item not found");

  await deleteItem(id);

  return json({ success: true }, { status: 200 });
};
