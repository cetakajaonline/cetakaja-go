// src/routes/categories/+page.server.ts
import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { getAllCategories } from '$lib/server/categoryService';
import type { Category } from '$lib/types';

export const load: PageServerLoad = async (event) => {
  const user = event.locals.user;
  if (!user) {
    throw redirect(302, '/login');
  }

  const isAdmin = user.role === 'admin';
  
  if (!isAdmin) {
    // Only admins can access categories page
    throw redirect(302, '/dashboard');
  }

  let categories: Category[] = [];

  if (isAdmin) {
    const all = await getAllCategories();
    categories = all.map((c) => ({
      ...c,
      createdAt: c.createdAt.toISOString(),
    }));
  }

  return {
    categories,
    isAdmin,
  };
};