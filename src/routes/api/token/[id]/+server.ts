import { json } from "@sveltejs/kit";
import { updateKey, deleteKey, getKeyById } from "$lib/server/tokenService";
import { isAdmin, requireAnyRole } from "$lib/server/auth";
import type { RequestHandler } from "./$types";

// GET /api/token/:id
export const GET: RequestHandler = async (event) => {
  requireAnyRole(event);

  const id = Number(event.params.id);
  if (isNaN(id)) throw new Error("Invalid token ID");

  const token = await getKeyById(id);
  if (!token) throw new Error("Token not found");

  // Hanya admin atau pemilik token yang boleh akses
  const user = event.locals.user;
  if (!isAdmin(event) && token.createdBy !== user.id) {
    throw new Error("Forbidden");
  }

  return json(token);
};

// PUT /api/token/:id
export const PUT: RequestHandler = async (event) => {
  requireAnyRole(event);

  const id = Number(event.params.id);
  if (isNaN(id)) throw new Error("Invalid token ID");

  const token = await getKeyById(id);
  if (!token) throw new Error("Token not found");

  const user = event.locals.user;
  if (!isAdmin(event) && token.createdBy !== user.id) {
    throw new Error("Forbidden");
  }

  const body = await event.request.json();
  const updated = await updateKey(id, {
    name: body.name,
    revoked: body.revoked,
  });

  return json(updated);
};

// DELETE /api/token/:id
export const DELETE: RequestHandler = async (event) => {
  requireAnyRole(event);

  const id = Number(event.params.id);
  if (isNaN(id)) throw new Error("Invalid token ID");

  const token = await getKeyById(id);
  if (!token) throw new Error("Token not found");

  const user = event.locals.user;
  // Hanya admin atau pemilik token yang boleh menghapus
  if (!isAdmin(event) && token.createdBy !== user.id) {
    throw new Error("Forbidden");
  }

  await deleteKey(id);
  return json({ success: true });
};
