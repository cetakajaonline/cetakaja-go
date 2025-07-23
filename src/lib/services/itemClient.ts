export async function createItem(form: FormData) {
  const res = await fetch("/api/items", {
    method: "POST",
    body: form,
  });
  return await res.json();
}

export async function updateItem(id: number, form: FormData) {
  const res = await fetch(`/api/items/${id}`, {
    method: "PUT",
    body: form,
  });
  return await res.json();
}

export async function deleteItem(id: number) {
  const res = await fetch(`/api/items/${id}`, {
    method: "DELETE",
  });
  return res.ok;
}

export async function getItem(id: number) {
  const res = await fetch(`/api/items/${id}`);
  if (!res.ok) {
    throw new Error("Failed to fetch item");
  }
  return await res.json();
}
