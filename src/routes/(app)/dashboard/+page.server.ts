// src/routes/(app)/dashboard/+page.server.ts
import { getAllUsers } from "$lib/server/userService";
import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals }) => {
  if (!locals.user) throw redirect(302, "/login");

  const users = await getAllUsers();

  return {
    user: locals.user,
    users,
  };
};

