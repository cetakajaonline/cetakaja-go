// src/routes/(app)/dashboard/+page.server.ts
import { getAllUsers } from "$lib/server/userService";
import { redirect } from "@sveltejs/kit";

export async function load({ locals }) {
  if (!locals.user) throw redirect(302, "/login");

  const users = await getAllUsers();

  return {
    user: locals.user,
    users,
  };
}
