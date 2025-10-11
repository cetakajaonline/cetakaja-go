// src/routes/api/public/categories/+server.ts
import { json } from "@sveltejs/kit";
import { getAllCategories } from "$lib/server/categoryService";
import type { RequestHandler } from "./$types";

// GET: Public endpoint to get all categories
export const GET: RequestHandler = async () => {
  try {
    const categories = await getAllCategories();
    // Only return necessary fields for public consumption
    const publicCategories = categories.map(category => ({
      id: category.id,
      name: category.name,
      code: category.code,
      description: category.description
    }));
    
    return json(publicCategories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return json({ message: "Gagal mengambil data kategori" }, { status: 500 });
  }
};