import { json, error } from "@sveltejs/kit";
import { updateKey, deleteKey, getKeyById } from "$lib/server/tokenService";
import type { RequestHandler } from "./$types";

// GET /api/token/:id
export const GET: RequestHandler = async ({ params, locals }) => {
  if (!locals.user) throw error(401, "Unauthorized");

  const id = Number(params.id);
  if (isNaN(id)) throw error(400, "Invalid token ID");

  try {
    const token = await getKeyById(id);
    if (!token) throw error(404, "Token not found");

    // Optional: validasi hanya bisa akses token miliknya
    if (token.createdBy !== locals.user.id) {
      throw error(403, "Forbidden");
    }

    return json(token);
  } catch (err) {
    console.error(err);
    throw error(500, "Failed to fetch token");
  }
};

// PUT /api/token/:id
export const PUT: RequestHandler = async ({ params, request, locals }) => {
  if (!locals.user) throw error(401, "Unauthorized");

  const id = Number(params.id);
  if (isNaN(id)) throw error(400, "Invalid token ID");

  const body = await request.json();

  try {
    const existing = await getKeyById(id);
    if (!existing) throw error(404, "Token not found");

    if (existing.createdBy !== locals.user.id) {
      throw error(403, "Forbidden");
    }

    const updated = await updateKey(id, {
      name: body.name,
      revoked: body.revoked,
    });

    return json(updated);
  } catch (err) {
    console.error(err);
    throw error(500, "Failed to update token");
  }
};

// DELETE /api/token/:id
export const DELETE: RequestHandler = async ({ params, locals }) => {
  if (!locals.user) throw error(401, "Unauthorized");

  const id = Number(params.id);
  if (isNaN(id)) throw error(400, "Invalid token ID");

  try {
    const existing = await getKeyById(id);
    if (!existing) throw error(404, "Token not found");

    if (existing.createdBy !== locals.user.id) {
      throw error(403, "Forbidden");
    }

    await deleteKey(id);
    return json({ success: true });
  } catch (err) {
    console.error(err);
    throw error(500, "Failed to delete token");
  }
};
