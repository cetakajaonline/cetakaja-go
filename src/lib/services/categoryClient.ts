// src/lib/services/categoryClient.ts
import type { Category, ApiResponse } from "$lib/types";

// Get all categories
export async function getAllCategories(): Promise<Category[]> {
  const response = await fetch("/api/categories");
  if (!response.ok) {
    throw new Error("Gagal mengambil kategori");
  }
  const result: ApiResponse<Category[]> = await response.json();
  return result.data || [];
}

// Get category by ID
export async function getCategoryById(id: number): Promise<Category> {
  const response = await fetch(`/api/categories/${id}`);
  if (!response.ok) {
    throw new Error("Gagal mengambil kategori");
  }
  const result: ApiResponse<Category> = await response.json();
  return result.data!;
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
  return result.data!;
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
  return result.data!;
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
