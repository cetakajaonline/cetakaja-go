import type { Handle } from "@sveltejs/kit";
import jwt from "jsonwebtoken";
import prisma from "$lib/server/prisma";
const JWT_SECRET = process.env.JWT_SECRET || "changeme";

export const handle: Handle = async ({ event, resolve }) => {
  const token = event.cookies.get("token");

  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { id: number };
      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: { id: true, email: true, name: true }, // aman tanpa password
      });
      if (user) {
        event.locals.user = user;
      }
    } catch (err) {
      console.error("JWT error:", err);
      event.locals.user = undefined;
    }
  }

  return resolve(event);
};
