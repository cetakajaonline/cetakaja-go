// src/routes/api/auth/login/+server.ts
import prisma from "$lib/server/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { json } from "@sveltejs/kit";
import { loginSchema } from "$lib/validations/authSchema";
import type { RequestHandler } from "./$types";

const JWT_SECRET = process.env.JWT_SECRET || "changeme";

export const POST: RequestHandler = async ({ request, cookies }) => {
  try {
    const body = await request.json();

    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return json(
        {
          success: false,
          message: "Validasi gagal",
          errors: parsed.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const { username, password } = parsed.data;

    // Check if the input looks like a phone number (starts with 08 and has 10-15 digits total)
    // Phone numbers would be in format 08xxxxxxxxx (where x is a digit) 
    const isPhoneInput = /^08\d{8,13}$/.test(username);
    
    let user;
    if (isPhoneInput) {
      // If it looks like a phone number, search by phone
      user = await prisma.user.findUnique({ where: { phone: username } });
    } else {
      // Otherwise, search by username
      user = await prisma.user.findUnique({ where: { username } });
    }

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return json(
        { success: false, message: "Username atau password salah" },
        { status: 401 },
      );
    }

    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: "7d" });

    cookies.set("token", token, {
      path: "/",
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7,
    });

    return json({ success: true, data: { user: { id: user.id, name: user.name, username: user.username, phone: user.phone } } });
  } catch (error) {
    console.error('Login error:', error);
    return json(
      { success: false, message: "Terjadi kesalahan saat login" },
      { status: 500 },
    );
  }
};
