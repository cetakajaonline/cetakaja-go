// src/routes/(app)/dashboard/+page.server.ts
import { getAllItems } from "$lib/server/itemService";
import { getAllUsers } from "$lib/server/userService";
import { getAllKeys } from "$lib/server/tokenService";
import { redirect } from "@sveltejs/kit";

export async function load({ locals }) {
  // eslint-disable-next-line @typescript-eslint/only-throw-error
  if (!locals.user) throw redirect(302, "/login");

  const [items, users, tokens] = await Promise.all([
    getAllItems(),
    getAllUsers(),
    getAllKeys(),
  ]);

  return {
    user: locals.user,
    items,
    users,
    tokens,
  };
}
