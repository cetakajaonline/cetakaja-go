// src/routes/products/+page.server.ts
import type { PageServerLoad } from "./$types";
import { redirect } from "@sveltejs/kit";
import { getAllUsers } from "$lib/server/userService";
import type { User } from "$lib/types";

export const load: PageServerLoad = async (event) => {
  const user = event.locals.user;
  if (!user) {
    throw redirect(302, "/login");
  }

  const isAdmin = user.role === "admin";

  if (!isAdmin) {
    // Only admins can access products page
    throw redirect(302, "/dashboard");
  }

  const users: User[] = await getAllUsers(); // Menyediakan data users karena diperlukan oleh PageData

  return {
    isAdmin,
    users,
  };
};
