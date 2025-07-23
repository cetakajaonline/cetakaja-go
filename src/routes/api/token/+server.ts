import { json } from "@sveltejs/kit";
import {
  getAllKeys,
  createKey,
  getKeysByUserId,
} from "$lib/server/tokenService";
import { requireAnyRole, isAdmin } from "$lib/server/auth";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async (event) => {
  requireAnyRole(event);

  const user = event.locals.user!;
  let tokens;

  if (isAdmin(event)) {
    tokens = await getAllKeys();
  } else {
    tokens = await getKeysByUserId(user.id);
  }

  return json(tokens);
};

export const POST: RequestHandler = async (event) => {
  requireAnyRole(event);

  const user = event.locals.user!;
  const body = await event.request.json();

  try {
    const newKey = await createKey({
      name: body.name,
      token: body.token,
      createdBy: user.id,
    });

    return json(newKey);
  } catch (err) {
    console.error(err);
    return json({ error: "Gagal membuat token" }, { status: 500 });
  }
};
