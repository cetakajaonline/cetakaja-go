import { json, error } from "@sveltejs/kit";
import { getAllKeys, createKey } from "$lib/server/tokenService";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ locals }) => {
  if (!locals.user) throw error(401, "Unauthorized");

  const tokens = await getAllKeys();
  return json(tokens);
};

export const POST: RequestHandler = async ({ request, locals }) => {
  if (!locals.user) {
    return json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();

  try {
    const newKey = await createKey({
      name: body.name,
      token: body.token,
      createdBy: locals.user.id,
    });

    return json(newKey);
  } catch (err) {
    console.error(err);
    return json({ error: "Gagal membuat token" }, { status: 500 });
  }
};
