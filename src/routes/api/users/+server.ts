import { json, error } from "@sveltejs/kit";
import {
  getAllUsers,
  createUser,
  getUserByEmail,
} from "$lib/server/userService";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ locals }) => {
  if (!locals.user) throw error(401, "Unauthorized");
  const users = await getAllUsers();
  return json(users);
};

export const POST: RequestHandler = async ({ request, locals }) => {
  if (!locals.user) return json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();

  const existing = await getUserByEmail(body.email);
  if (existing) {
    return json({ error: "Email sudah terdaftar" }, { status: 400 });
  }

  try {
    const newUser = await createUser(body);
    return json(newUser);
  } catch (err) {
    console.error(err);
    return json({ error: "Gagal membuat user" }, { status: 500 });
  }
};
