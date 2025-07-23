// src/hooks.server.ts
import type { Handle } from "@sveltejs/kit";
import jwt from "jsonwebtoken";
import prisma from "$lib/server/prisma";

const JWT_SECRET = process.env.JWT_SECRET || "changeme";

export const handle: Handle = async ({ event, resolve }) => {
  const authHeader = event.request.headers.get("authorization");
  const cookieToken = event.cookies.get("token");

  // 1. Cek Authorization: Bearer <token> (akses API eksternal)
  if (authHeader?.startsWith("Bearer ")) {
    const apiToken = authHeader.split(" ")[1];

    const tokenRecord = await prisma.apiToken.findUnique({
      where: { token: apiToken },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true, // ✅ Ambil role dari creator
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
          role: true, // ✅ Ambil juga role di sini
        },
      });

      if (user) {
        event.locals.user = user;
      }
    } catch (err) {
      console.error("Invalid JWT cookie:", err);
      event.locals.user = undefined;
    }
  }

  return resolve(event);
};
