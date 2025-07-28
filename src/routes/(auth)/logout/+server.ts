// src/routes/(auth)/logout/+server.ts
import { redirect } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = ({ cookies }) => {
  cookies.delete("token", { path: "/" });
  throw redirect(302, "/login");
};
