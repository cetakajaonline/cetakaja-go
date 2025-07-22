export async function createUser(form: FormData) {
  const res = await fetch("/api/users", {
    method: "POST",
    body: form,
  });
  return await res.json();
}

export async function updateUser(id: number, form: FormData) {
  const res = await fetch(`/api/users/${id}`, {
    method: "PUT",
    body: form,
  });
  return await res.json();
}

export async function deleteUser(id: number) {
  const res = await fetch(`/api/users/${id}`, {
    method: "DELETE",
  });
  return res.ok;
}

export async function getUser(id: number) {
  const res = await fetch(`/api/users/${id}`);
  if (!res.ok) {
    throw new Error("Failed to fetch user");
  }
  return await res.json();
}
