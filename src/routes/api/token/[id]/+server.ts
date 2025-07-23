import { json, error } from "@sveltejs/kit";
import { updateKey, deleteKey, getKeyById } from "$lib/server/tokenService";
import { requireAdmin, requireRoleOrSelf } from "$lib/server/auth";
import type { RequestHandler } from "./$types";

// GET /api/token/:id
export const GET: RequestHandler = async (event) => {
  const id = Number(event.params.id);
  requireRoleOrSelf(event, id);
  if (isNaN(id)) throw error(400, "Invalid token ID");

  try {
    const token = await getKeyById(id);
    if (!token) throw error(404, "Token not found");

    // Optional: validasi hanya bisa akses token miliknya
    if (token.createdBy !== event.locals.user.id) {
      throw error(403, "Forbidden");
    }

    return json(token);
  } catch (err) {
    console.error(err);
    throw error(500, "Failed to fetch token");
  }
};

// PUT /api/token/:id
export const PUT: RequestHandler = async (event) => {
  const id = Number(event.params.id);
  requireRoleOrSelf(event, id);
  if (isNaN(id)) throw error(400, "Invalid token ID");

  const body = await event.request.json();

  try {
    const existing = await getKeyById(id);
    if (!existing) throw error(404, "Token not found");

    if (existing.createdBy !== event.locals.user.id) {
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
export const DELETE: RequestHandler = async (event) => {
  requireAdmin(event); // ⬅️ hanya admin yang bisa delete

  const id = Number(event.params.id);
  if (isNaN(id)) throw error(400, "Invalid token ID");

  try {
    const existing = await getKeyById(id);
    if (!existing) throw error(404, "Token not found");

    if (existing.createdBy !== event.locals.user.id) {
      throw error(403, "Forbidden");
    }

    await deleteKey(id);
    return json({ success: true });
  } catch (err) {
    console.error(err);
    throw error(500, "Failed to delete token");
  }
};
