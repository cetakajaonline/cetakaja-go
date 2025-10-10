// src/routes/categories/+page.server.ts
import type { PageServerLoad } from "./$types";
import { redirect } from "@sveltejs/kit";
import { getAllCategories } from "$lib/server/categoryService";
import { getAllUsers } from "$lib/server/userService";
import type { Category, User } from "$lib/types";

export const load: PageServerLoad = async (event) => {
  const user = event.locals.user;
  if (!user) {
    throw redirect(302, "/login");
  }

  const isAdmin = user.role === "admin";

  if (!isAdmin) {
    // Only admins can access categories page
    throw redirect(302, "/dashboard");
  }

  let categories: Category[] = [];
  const users: User[] = await getAllUsers(); // Menyediakan data users karena diperlukan oleh PageData

  if (isAdmin) {
    categories = await getAllCategories();
  }

  return {
    categories,
    isAdmin,
    users,
  };
};
