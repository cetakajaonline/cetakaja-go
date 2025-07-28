import { json } from "@sveltejs/kit";
import { updateUser, deleteUser, getUserById } from "$lib/server/userService";
import { requireAdmin, requireRoleOrSelf } from "$lib/server/auth";
import type { RequestHandler } from "./$types";
import { userUpdateSchema } from "$lib/validations/userSchema";

// PUT: update user by ID (boleh oleh admin atau user itu sendiri)
export const PUT: RequestHandler = async (event) => {
  const id = Number(event.params.id);
  const body = await event.request.json();

  requireRoleOrSelf(event, id); // Hanya admin atau user itu sendiri

  const parsed = userUpdateSchema.safeParse(body);
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
    const updated = await updateUser(id, parsed.data);
    return json(updated);
  } catch (err) {
    console.error(err);
    return json({ message: "Gagal mengupdate user" }, { status: 500 });
  }
};

// DELETE: hanya admin yang bisa hapus user
export const DELETE: RequestHandler = async (event) => {
  requireAdmin(event);

  const id = Number(event.params.id);
  try {
    await deleteUser(id);
    return json({ success: true });
  } catch (err) {
    console.error(err);
    return json({ message: "Gagal menghapus user" }, { status: 500 });
  }
};

// GET: ambil data user tertentu (admin atau user itu sendiri)
export const GET: RequestHandler = async (event) => {
  const id = Number(event.params.id);
  requireRoleOrSelf(event, id);

  try {
    const user = await getUserById(id);
    if (!user) {
      return json({ message: "User tidak ditemukan" }, { status: 404 });
    }
    return json(user);
  } catch (err) {
    console.error(err);
    return json({ message: "Gagal mengambil data user" }, { status: 500 });
  }
};
