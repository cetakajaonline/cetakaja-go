// src/routes/api/auth/register/+server.ts
import prisma from "$lib/server/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { json } from "@sveltejs/kit";
import { registerSchema } from "$lib/validations/authSchema";
import type { RequestHandler } from "./$types";

const JWT_SECRET = process.env.JWT_SECRET || "changeme";

export const POST: RequestHandler = async ({ request, cookies }) => {
  try {
    const body = await request.json();

    // Use register schema for validation
    const parsed = registerSchema.safeParse(body);
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

    const { name, username, phone, password } = parsed.data;

    // Check if username or phone already exists
    const existingUserByUsername = await prisma.user.findUnique({
      where: { username },
    });

    const existingUserByPhone = await prisma.user.findUnique({
      where: { phone },
    });

    if (existingUserByUsername) {
      return json(
        { success: false, message: "Username sudah terdaftar" },
        { status: 400 },
      );
    }

    if (existingUserByPhone) {
      return json(
        { success: false, message: "Nomor telepon sudah terdaftar" },
        { status: 400 },
      );
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user with customer role
    const newUser = await prisma.user.create({
      data: {
        name,
        username,
        phone,
        password: hashedPassword,
        role: "customer", // Default role for public registration
      },
    });

    // Create JWT token
    const token = jwt.sign({ id: newUser.id }, JWT_SECRET, { expiresIn: "7d" });

    // Set cookie
    cookies.set("token", token, {
      path: "/",
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7,
    });

    // Return success response (exclude password from response)
    const { ...userWithoutPassword } = newUser;

    return json({
      success: true,
      data: { user: userWithoutPassword },
    });
  } catch (error) {
    console.error("Registration error:", error);
    return json(
      { success: false, message: "Terjadi kesalahan saat registrasi" },
      { status: 500 },
    );
  }
};
