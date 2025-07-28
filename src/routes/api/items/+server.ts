import { json } from "@sveltejs/kit";
import { getAllItems, createItem } from "$lib/server/itemService";
import { requireAnyRole } from "$lib/server/auth";
import type { RequestHandler } from "./$types";
import { itemSchema } from "$lib/validations/itemSchema";

export const GET: RequestHandler = async (event) => {
  requireAnyRole(event);

  const items = await getAllItems();
  return json(items);
};

export const POST: RequestHandler = async (event) => {
  requireAnyRole(event);

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

  try {
    const newItem = await createItem(parsed.data);
    return json(newItem);
  } catch (err) {
    console.error(err);
    return json({ error: "Gagal membuat item" }, { status: 500 });
  }
};
