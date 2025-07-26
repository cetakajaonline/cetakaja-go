import type { User } from "$lib/types";

export async function createUser(form: FormData): Promise<User> {
  const res = await fetch("/api/users", {
    method: "POST",
    body: form,
  });

  if (!res.ok) {
    throw new Error("Failed to create user");
  }

  return (await res.json()) as User;
}

export async function updateUser(id: number, form: FormData): Promise<User> {
  const res = await fetch(`/api/users/${id}`, {
    method: "PUT",
    body: form,
  });

  if (!res.ok) {
    throw new Error("Failed to update user");
  }

  return (await res.json()) as User;
}

export async function deleteUser(id: number): Promise<boolean> {
  const res = await fetch(`/api/users/${id}`, {
    method: "DELETE",
  });

  return res.ok;
}

export async function getUser(id: number): Promise<User> {
  const res = await fetch(`/api/users/${id}`);

  if (!res.ok) {
    throw new Error("Failed to fetch user");
  }

  return (await res.json()) as User;
}
