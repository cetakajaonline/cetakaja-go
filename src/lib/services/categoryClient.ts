// src/lib/services/categoryClient.ts
import type { Category, ApiResponse } from "$lib/types";

// Get all categories
export async function getAllCategories(): Promise<Category[]> {
  const response = await fetch("/api/categories");
  if (!response.ok) {
    throw new Error("Gagal mengambil kategori");
  }
  const result: ApiResponse<Category[]> = await response.json();
  // Convert string dates to Date objects, with null check
  const categoriesData = result.data || [];
  return categoriesData.map(category => ({
    ...category,
    createdAt: category.createdAt ? new Date(category.createdAt) : new Date()
  })) as Category[];
}

// Get category by ID
export async function getCategoryById(id: number): Promise<Category> {
  const response = await fetch(`/api/categories/${id}`);
  if (!response.ok) {
    throw new Error("Gagal mengambil kategori");
  }
  const result: ApiResponse<Category> = await response.json();
  // Convert string dates to Date objects, with null check
  const categoryData = result.data!;
  return {
    ...categoryData,
    createdAt: categoryData.createdAt ? new Date(categoryData.createdAt) : new Date()
  } as Category;
}

// Create category
export async function createCategory(
  category: Omit<Category, "id" | "createdAt">,
): Promise<Category> {
  const response = await fetch("/api/categories", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(category),
  });

  if (!response.ok) {
    const errorData: ApiResponse = await response.json();
    throw new Error(errorData.message || "Gagal membuat kategori");
  }

  const result: ApiResponse<Category> = await response.json();
  // Check if data exists before processing
  if (!result.data) {
    throw new Error("Response data is empty");
  }
  
  // Convert string dates to Date objects, with null check
  const categoryData = result.data;
  return {
    ...categoryData,
    createdAt: categoryData.createdAt ? new Date(categoryData.createdAt) : new Date()
  } as Category;
}

// Update category
export async function updateCategory(
  id: number,
  category: Partial<Category>,
): Promise<Category> {
  const response = await fetch(`/api/categories/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(category),
  });

  if (!response.ok) {
    const errorData: ApiResponse = await response.json();
    throw new Error(errorData.message || "Gagal mengupdate kategori");
  }

  const result: ApiResponse<Category> = await response.json();
  // Convert string dates to Date objects, with null check
  const categoryData = result.data!;
  return {
    ...categoryData,
    createdAt: categoryData.createdAt ? new Date(categoryData.createdAt) : new Date()
  } as Category;
}

// Delete category
export async function deleteCategory(id: number): Promise<void> {
  const response = await fetch(`/api/categories/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const errorData: ApiResponse = await response.json();
    throw new Error(errorData.message || "Gagal menghapus kategori");
  }
}
