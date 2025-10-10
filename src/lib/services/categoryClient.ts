// src/lib/services/categoryClient.ts
import type { Category } from "$lib/types";

// Get all categories
export async function getAllCategories(): Promise<Category[]> {
  const response = await fetch("/api/categories");
  if (!response.ok) {
    throw new Error("Gagal mengambil kategori");
  }
  const categories: Category[] = await response.json();
  return categories.map((category: Category) => ({
    ...category,
    createdAt: category.createdAt ? new Date(category.createdAt) : new Date(),
  }));
}

// Get category by ID
export async function getCategoryById(id: number): Promise<Category> {
  const response = await fetch(`/api/categories/${id}`);
  if (!response.ok) {
    throw new Error("Gagal mengambil kategori");
  }
  const category: Category = await response.json();
  return {
    ...category,
    createdAt: category.createdAt ? new Date(category.createdAt) : new Date(),
  };
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
    const errorData = await response.json();

    // If it's a validation error with detailed field errors, concatenate all messages
    if (errorData.errors && Array.isArray(errorData.errors)) {
      const validationMessages = errorData.errors.map(
        (err: { message: string }) => err.message,
      );
      throw new Error(validationMessages.join(", "));
    }

    throw new Error(errorData.message || "Gagal membuat kategori");
  }

  const result: Category = await response.json();
  return {
    ...result,
    createdAt: result.createdAt ? new Date(result.createdAt) : new Date(),
  };
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
    const errorData = await response.json();

    // If it's a validation error with detailed field errors, concatenate all messages
    if (errorData.errors && Array.isArray(errorData.errors)) {
      const validationMessages = errorData.errors.map(
        (err: { message: string }) => err.message,
      );
      throw new Error(validationMessages.join(", "));
    }

    throw new Error(errorData.message || "Gagal mengupdate kategori");
  }

  const result: Category = await response.json();
  return {
    ...result,
    createdAt: result.createdAt ? new Date(result.createdAt) : new Date(),
  };
}

// Delete category
export async function deleteCategory(id: number): Promise<void> {
  const response = await fetch(`/api/categories/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Gagal menghapus kategori");
  }
}

