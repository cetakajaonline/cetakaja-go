import { json, error } from "@sveltejs/kit";
import { getAllItems, createItem } from "$lib/server/itemService";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ locals }) => {
  if (!locals.user) throw error(401, "Unauthorized");

  const items = await getAllItems();
  return json(items);
};

export const POST: RequestHandler = async ({ request, locals }) => {
  if (!locals.user) {
    return json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();

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
