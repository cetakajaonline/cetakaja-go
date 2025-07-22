// src/routes/api/login/+server.ts
import prisma from "$lib/server/prisma";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { json } from "@sveltejs/kit";

const JWT_SECRET = process.env.JWT_SECRET || "changeme";

export async function POST({ request, cookies }) {
  try {
    const { email, password } = await request.json();

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      // Balikkan status 401 agar bisa di-handle di client
      return json(
        { success: false, message: "Email atau password salah" },
        { status: 401 }
      );
    }

    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: "7d" });

    cookies.set("token", token, {
      path: "/",
      httpOnly: true,
      sameSite: "strict",
      secure: false,
      maxAge: 60 * 60 * 24 * 7,
    });

    return json({ success: true });
  } catch (error) {
    console.error("Login Error:", error);
    return json(
      { success: false, message: "Terjadi kesalahan saat login" },
      { status: 500 }
    );
  }
}
