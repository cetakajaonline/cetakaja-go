import type { Product, ApiResponse } from "$lib/types";

export async function createProduct(
  product: Omit<Product, "id" | "createdAt" | "category" | "variants"> & {
    variants: { variantName: string; price: number }[];
    photo?: string | null;
  },
): Promise<Product> {
  // Kirim data produk ke API
  const response = await fetch("/api/products", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      ...product,
      photo: product.photo || undefined,
    }),
  });

  if (!response.ok) {
    const errorData: ApiResponse = await response.json();
    throw new Error(errorData.message || "Gagal membuat produk");
  }

  const result: ApiResponse<Product> = await response.json();
  return result.data!;
}

export async function updateProduct(
  id: number,
  product: Partial<Omit<Product, "id" | "createdAt" | "category">> & {
    variants?: {
      id?: number;
      variantName: string;
      price: number;
      delete?: boolean;
    }[];
    photo?: string | null;
  },
): Promise<Product> {
  // Kirim data produk ke API
  const response = await fetch(`/api/products/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      ...product,
      photo: product.photo || undefined,
    }),
  });

  if (!response.ok) {
    const errorData: ApiResponse = await response.json();
    throw new Error(errorData.message || "Gagal memperbarui produk");
  }

  const result: ApiResponse<Product> = await response.json();
  return result.data!;
}

export async function deleteProduct(id: number): Promise<void> {
  const response = await fetch(`/api/products/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const errorData: ApiResponse = await response.json();
    throw new Error(errorData.message || "Gagal menghapus produk");
  }
}
