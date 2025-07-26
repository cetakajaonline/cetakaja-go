// src/routes/api/users/+server.ts
import { json } from "@sveltejs/kit";
import { requireAdmin } from "$lib/server/auth";
import {
  getAllUsers,
  createUser,
  getUserByEmail,
} from "$lib/server/userService";
import type { RequestHandler } from "./$types";

// GET: hanya admin yang boleh akses
export const GET: RequestHandler = async (event) => {
  requireAdmin(event); // akan throw error kalau bukan admin
  const users = await getAllUsers();
  return json(users);
};

// POST: hanya admin yang boleh buat user baru
export const POST: RequestHandler = async (event) => {
  requireAdmin(event); // validasi admin lebih awal

  const body = await event.request.json();

  const existing = await getUserByEmail(body.email);
  if (existing) {
    throw new Error("Email sudah terdaftar");
  }

  try {
    const newUser = await createUser(body);
    return json(newUser);
  } catch (err) {
    console.error(err);
    throw new Error("Gagal membuat user");
  }
};
