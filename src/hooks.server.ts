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
  if (process.env.NODE_ENV !== 'production') {
    await prisma.$connect(); // hanya warm-up saat dev
  }

  const authHeader = event.request.headers.get("authorization");
  const cookieToken = event.cookies.get("token");

  // 1. Cek Authorization: Bearer <token> (akses API eksternal)
  if (authHeader?.startsWith("Bearer ")) {
    const apiToken = authHeader.split(" ")[1];

    try {
      const tokenRecord = await prisma.apiToken.findUnique({
        where: { token: apiToken },
        include: {
          creator: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
              createdAt: true,
              photo: true,
            },
          },
        },
      });

      if (tokenRecord && !tokenRecord.revoked) {
        event.locals.token = tokenRecord;
        event.locals.user = tokenRecord.creator;
        return resolve(event);
      } else {
        console.warn("Invalid or revoked API token");
      }
    } catch (err) {
      console.error("Error verifying API token:", err);
    }
  }

  // 2. Cek cookie JWT (login dari browser)
  if (cookieToken) {
    try {
      const decoded = jwt.verify(cookieToken, JWT_SECRET) as { id: number };

      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
          photo: true
        },
      });

      if (user) {
        event.locals.user = user;
      } else {
        console.warn("User not found for decoded token ID");
        event.cookies.delete("token", { path: "/" });
      }
    } catch (err) {
      console.error("Invalid JWT cookie:", err);
      event.cookies.delete("token", { path: "/" }); // 🔥 Hapus token rusak
      event.locals.user = undefined;
    }
  }

  return resolve(event);
};
