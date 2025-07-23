import { json } from "@sveltejs/kit";
import { getAllKeys, createKey } from "$lib/server/tokenService";
import { requireAdmin } from "$lib/server/auth";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async (event) => {
  requireAdmin(event); // hanya admin yang boleh akses

  const tokens = await getAllKeys();
  return json(tokens);
};

export const POST: RequestHandler = async (event) => {
  requireAdmin(event); // hanya admin yang boleh akses

  const body = await event.request.json();

  try {
    const newKey = await createKey({
      name: body.name,
      token: body.token,
      createdBy: event.locals.user.id,
    });

    return json(newKey);
  } catch (err) {
    console.error(err);
    return json({ error: "Gagal membuat token" }, { status: 500 });
  }
};
