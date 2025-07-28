import { json } from "@sveltejs/kit";
import { updateKey, deleteKey, getKeyById } from "$lib/server/tokenService";
import { isAdmin, requireAnyRole } from "$lib/server/auth";
import type { RequestHandler } from "./$types";
import { tokenUpdateSchema } from "$lib/validations/tokenSchema";

// GET /api/token/:id
export const GET: RequestHandler = async (event) => {
  requireAnyRole(event);

  const id = Number(event.params.id);
  if (isNaN(id)) throw new Error("ID token tidak valid");

  const token = await getKeyById(id);
  if (!token) throw new Error("Token tidak ditemukan");

  const user = event.locals.user;
  if (!isAdmin(event) && token.createdBy !== user.id) {
    throw new Error("Tidak diizinkan");
  }

  return json(token);
};

// PUT /api/token/:id
export const PUT: RequestHandler = async (event) => {
  requireAnyRole(event);

  const id = Number(event.params.id);
  if (isNaN(id)) throw new Error("ID token tidak valid");

  const token = await getKeyById(id);
  if (!token) throw new Error("Token tidak ditemukan");

  const user = event.locals.user;
  if (!isAdmin(event) && token.createdBy !== user.id) {
    throw new Error("Tidak diizinkan");
  }

  const body = await event.request.json();
  const parsed = tokenUpdateSchema.safeParse(body);

  if (!parsed.success) {
    return json(
      {
        message: "Validasi gagal",
        errors: parsed.error.flatten().fieldErrors,
      },
      { status: 400 }
    );
  }

  const updated = await updateKey(id, parsed.data);
  return json(updated);
};

// DELETE /api/token/:id
export const DELETE: RequestHandler = async (event) => {
  requireAnyRole(event);

  const id = Number(event.params.id);
  if (isNaN(id)) throw new Error("ID token tidak valid");

  const token = await getKeyById(id);
  if (!token) throw new Error("Token tidak ditemukan");

  const user = event.locals.user;
  if (!isAdmin(event) && token.createdBy !== user.id) {
    throw new Error("Tidak diizinkan");
  }

  await deleteKey(id);
  return json({ success: true });
};
