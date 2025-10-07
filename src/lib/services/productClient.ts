import type { Product } from "$lib/types";

export async function createProduct(product: Omit<Product, 'id' | 'createdAt' | 'category' | 'variants'> & { 
  variants: { variantName: string; price: number }[]; 
  photo?: string | null;
}): Promise<Product> {
  // Kirim data produk ke API
  const response = await fetch('/api/products', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ...product,
      photo: product.photo || undefined
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Gagal membuat produk');
  }

  return response.json();
}

export async function updateProduct(id: number, product: Partial<Omit<Product, 'id' | 'createdAt' | 'category'>> & { 
  variants?: { id?: number; variantName: string; price: number; delete?: boolean }[]; 
  photo?: string | null;
}): Promise<Product> {
  // Kirim data produk ke API
  const response = await fetch(`/api/products/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ...product,
      photo: product.photo || undefined
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Gagal memperbarui produk');
  }

  return response.json();
}

export async function deleteProduct(id: number): Promise<void> {
  const response = await fetch(`/api/products/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Gagal menghapus produk');
  }
}