import type { Item } from "$lib/types";

export async function createItem(form: FormData): Promise<Item> {
  const res = await fetch("/api/items", {
    method: "POST",
    body: form,
  });

  if (!res.ok) {
    throw new Error("Gagal membuat item");
  }

  return (await res.json()) as Item;
}

export async function updateItem(id: number, form: FormData): Promise<Item> {
  const res = await fetch(`/api/items/${id}`, {
    method: "PUT",
    body: form,
  });

  if (!res.ok) {
    throw new Error("Gagal memperbarui item");
  }

  return (await res.json()) as Item;
}

export async function deleteItem(id: number): Promise<boolean> {
  const res = await fetch(`/api/items/${id}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    throw new Error("Gagal menghapus item");
  }

  return true;
}

export async function getItem(id: number): Promise<Item> {
  const res = await fetch(`/api/items/${id}`);

  if (!res.ok) {
    throw new Error("Gagal mengambil item");
  }

  return (await res.json()) as Item;
}
