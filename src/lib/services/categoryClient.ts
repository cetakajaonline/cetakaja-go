// src/lib/services/categoryClient.ts
import type { Category } from "$lib/types";

// Get all categories
export async function getAllCategories(): Promise<Category[]> {
  const response = await fetch('/api/categories');
  if (!response.ok) {
    throw new Error('Gagal mengambil kategori');
  }
  return response.json();
}

// Get category by ID
export async function getCategoryById(id: number): Promise<Category> {
  const response = await fetch(`/api/categories/${id}`);
  if (!response.ok) {
    throw new Error('Gagal mengambil kategori');
  }
  return response.json();
}

// Create category
export async function createCategory(category: Omit<Category, 'id' | 'createdAt'>): Promise<Category> {
  const response = await fetch('/api/categories', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(category),
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Gagal membuat kategori');
  }
  
  return response.json();
}

// Update category
export async function updateCategory(id: number, category: Partial<Category>): Promise<Category> {
  const response = await fetch(`/api/categories/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(category),
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Gagal mengupdate kategori');
  }
  
  return response.json();
}

// Delete category
export async function deleteCategory(id: number): Promise<void> {
  const response = await fetch(`/api/categories/${id}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Gagal menghapus kategori');
  }
}