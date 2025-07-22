// src/routes/logout/+server.ts
import { redirect } from "@sveltejs/kit";

export async function GET({ cookies }) {
  cookies.delete("token", { path: "/" });
  throw redirect(302, "/login");
}
