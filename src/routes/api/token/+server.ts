import { json } from "@sveltejs/kit";
import {
  getAllKeys,
  createKey,
  getKeysByUserId,
} from "$lib/server/tokenService";
import { requireAnyRole, isAdmin } from "$lib/server/auth";
import type { RequestHandler } from "./$types";
import { tokenSchema } from "$lib/validations/tokenSchema";

export const GET: RequestHandler = async (event) => {
  requireAnyRole(event);

  const user = event.locals.user;
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

  const user = event.locals.user;
  const body = await event.request.json();

  // ✅ Validasi dengan Zod
  const parsed = tokenSchema.safeParse({
    ...body,
    createdBy: user.id, // tambahkan relasi user
  });

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
    const newKey = await createKey(parsed.data);
    return json(newKey);
  } catch (err) {
    console.error(err);
    return json({ error: "Gagal membuat token" }, { status: 500 });
  }
};
