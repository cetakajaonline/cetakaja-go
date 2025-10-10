// src/hooks.server.ts
import type { Handle } from "@sveltejs/kit";
import jwt from "jsonwebtoken";
import prisma from "$lib/server/prisma";

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined in environment variables");
}

export const handle: Handle = async ({ event, resolve }) => {
  // 🌡️ Pastikan Prisma siap sebelum lanjut
  if (process.env.NODE_ENV !== "production") {
    await prisma.$connect(); // hanya warm-up saat dev
  }

  const cookieToken = event.cookies.get("token");

  // Cek cookie JWT (login dari browser)
  if (cookieToken) {
    try {
      const decoded = jwt.verify(cookieToken, JWT_SECRET) as { id: number };

      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: {
          id: true,
          name: true,
          username: true,
          phone: true,
          address: true,
          role: true,
          createdAt: true,
        },
      });

      if (user) {
        event.locals.user = user;
      } else {
        event.cookies.delete("token", { path: "/" });
      }
    } catch {
      event.cookies.delete("token", { path: "/" }); // 🔥 Hapus token rusak
      event.locals.user = undefined;
    }
  }

  return resolve(event);
};
