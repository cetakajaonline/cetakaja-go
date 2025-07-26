// src/routes/api/logout/+server.ts
import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

export const POST: RequestHandler = ({ cookies }) => {
  cookies.delete("token", {
    path: "/",
    httpOnly: true,
    sameSite: "strict",
    secure: false,
  });

  return json({ success: true, message: "Logout berhasil" });
};
