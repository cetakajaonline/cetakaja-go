import { json } from "@sveltejs/kit";
import { getAllItems, createItem } from "$lib/server/itemService";
import { requireAnyRole } from "$lib/server/auth";
import type { RequestHandler } from "./$types";

// GET /api/items
// Hanya user login yang memiliki role (admin/user/dll) yang diizinkan
export const GET: RequestHandler = async (event) => {
  requireAnyRole(event);

  const items = await getAllItems();
  return json(items);
};

// POST /api/items
// Hanya user login yang memiliki role yang diizinkan
export const POST: RequestHandler = async (event) => {
  requireAnyRole(event);

  const body = await event.request.json();

  try {
    const newItem = await createItem({
      name: body.name,
      desc: body.desc,
    });

    return json(newItem);
  } catch (err) {
    console.error(err);
    return json({ error: "Gagal membuat item" }, { status: 500 });
  }
};
