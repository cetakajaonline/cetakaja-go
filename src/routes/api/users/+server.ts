// src/routes/api/users/+server.ts
import { json } from "@sveltejs/kit";
import { requireAdmin } from "$lib/server/auth";
import {
  getAllUsers,
  createUser,
  getUserByEmail,
} from "$lib/server/userService";
import type { RequestHandler } from "./$types";
import { userSchema } from "$lib/validations/userSchema";

// GET: hanya admin yang boleh akses
export const GET: RequestHandler = async (event) => {
  requireAdmin(event);
  const users = await getAllUsers();
  return json(users);
};

// POST: hanya admin yang boleh buat user baru
export const POST: RequestHandler = async (event) => {
  requireAdmin(event);

  const body = await event.request.json();

  // ✅ Validasi Zod
  const parsed = userSchema.safeParse(body);
  if (!parsed.success) {
    return json(
      {
        message: "Validasi gagal",
        errors: parsed.error.flatten().fieldErrors,
      },
      { status: 400 }
    );
  }

  const data = parsed.data;

  const existing = await getUserByEmail(data.email);
  if (existing) {
    return json({ message: "Email sudah terdaftar" }, { status: 400 });
  }

  try {
    const newUser = await createUser(data);
    return json(newUser);
  } catch (err) {
    console.error(err);
    return json({ message: "Gagal membuat user" }, { status: 500 });
  }
};
