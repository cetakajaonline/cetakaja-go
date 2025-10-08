import type { Product } from "$lib/types";

export async function createProduct(
  productData: Omit<Product, "id" | "createdAt">,
): Promise<Product> {
  const res = await fetch("/api/products", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(productData),
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || "Failed to create product");
  }

  return (await res.json()) as Product;
}

export async function updateProduct(
  id: number,
  productData: Partial<Product>,
): Promise<Product> {
  const res = await fetch(`/api/products/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(productData),
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || "Failed to update product");
  }

  return (await res.json()) as Product;
}

export async function deleteProduct(id: number): Promise<boolean> {
  const res = await fetch(`/api/products/${id}`, {
    method: "DELETE",
  });

  return res.ok;
}

export async function getProduct(id: number): Promise<Product> {
  const res = await fetch(`/api/products/${id}`);

  if (!res.ok) {
    throw new Error("Failed to fetch product");
  }

  return (await res.json()) as Product;
}

export async function getAllProducts(): Promise<Product[]> {
  const res = await fetch("/api/products");

  if (!res.ok) {
    throw new Error("Failed to fetch products");
  }

  return (await res.json()) as Product[];
}
