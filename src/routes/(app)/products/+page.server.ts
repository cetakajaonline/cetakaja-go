// src/routes/products/+page.server.ts
import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { getAllProducts } from '$lib/server/productService';
import type { Product } from '$lib/types';

export const load: PageServerLoad = async (event) => {
  const user = event.locals.user;
  if (!user) {
    throw redirect(302, '/login');
  }

  const isAdmin = user.role === 'admin';
  
  if (!isAdmin) {
    // Only admins can access products page
    throw redirect(302, '/dashboard');
  }

  let products: Product[] = [];

  if (isAdmin) {
    const all = await getAllProducts();
    products = all.map((p) => ({
      ...p,
      createdAt: p.createdAt.toISOString(),
      variants: p.variants.map(v => ({
        ...v,
        createdAt: v.createdAt.toISOString()
      }))
    }));
  }

  return {
    products,
    isAdmin,
  };
};