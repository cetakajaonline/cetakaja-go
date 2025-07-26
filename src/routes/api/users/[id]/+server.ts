import { json } from "@sveltejs/kit";
import { updateUser, deleteUser, getUserById } from "$lib/server/userService";
import { requireAdmin, requireRoleOrSelf } from "$lib/server/auth";
import type { RequestHandler } from "./$types";

export const PUT: RequestHandler = async (event) => {
  const id = Number(event.params.id);
  const body = await event.request.json();
  requireRoleOrSelf(event, id);

  try {
    const updated = await updateUser(id, body);
    return json(updated);
  } catch (err) {
    console.error(err);
    throw new Error("Failed to update user");
  }
};

export const DELETE: RequestHandler = async (event) => {
  requireAdmin(event); // ⬅️ hanya admin yang bisa delete

  const id = Number(event.params.id);
  try {
    await deleteUser(id);
    return json({ success: true });
  } catch (err) {
    console.error(err);
    throw new Error("Failed to delete user");
  }
};

export const GET: RequestHandler = async (event) => {
  const id = Number(event.params.id);
  requireRoleOrSelf(event, id);

  try {
    const user = await getUserById(id);
    if (!user) throw new Error("User not found");
    return json(user);
  } catch (err) {
    console.error(err);
    throw new Error("Failed to fetch user");
  }
};
