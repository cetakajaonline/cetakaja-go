import { json, error } from "@sveltejs/kit";
import { updateUser, deleteUser, getUserById } from "$lib/server/userService";
import type { RequestHandler } from "./$types";

export const PUT: RequestHandler = async ({ params, request, locals }) => {
  if (!locals.user) throw error(401, "Unauthorized");
  const id = Number(params.id);
  const body = await request.json();

  try {
    const updated = await updateUser(id, body);
    return json(updated);
  } catch (err) {
    console.error(err);
    throw error(500, "Failed to update user");
  }
};

export const DELETE: RequestHandler = async ({ params, locals }) => {
  if (!locals.user) throw error(401, "Unauthorized");
  const id = Number(params.id);
  try {
    await deleteUser(id);
    return json({ success: true });
  } catch (err) {
    console.error(err);
    throw error(500, "Failed to delete user");
  }
};

export const GET: RequestHandler = async ({ params, locals }) => {
  if (!locals.user) throw error(401, "Unauthorized");
  const id = Number(params.id);
  try {
    const user = await getUserById(id);
    if (!user) throw error(404, "User not found");
    return json(user);
  } catch (err) {
    console.error(err);
    throw error(500, "Failed to fetch user");
  }
};
