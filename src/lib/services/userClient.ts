import type { User } from "$lib/types";

export async function createUser(
  userData: Omit<User, "id" | "createdAt"> & { password: string },
): Promise<User> {
  const res = await fetch("/api/users", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  });

  if (!res.ok) {
    const errorData = await res.json();
    
    // If it's a validation error with detailed field errors, concatenate all messages
    if (errorData.errors && Array.isArray(errorData.errors)) {
      const validationMessages = errorData.errors.map((err: any) => err.message);
      throw new Error(validationMessages.join(", "));
    }
    
    throw new Error(errorData.message || "Failed to create user");
  }

  return (await res.json()) as User;
}

export async function updateUser(
  id: number,
  userData: Partial<User & { password?: string }>,
): Promise<User> {
  const res = await fetch(`/api/users/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  });

  if (!res.ok) {
    const errorData = await res.json();
    
    // If it's a validation error with detailed field errors, concatenate all messages
    if (errorData.errors && Array.isArray(errorData.errors)) {
      const validationMessages = errorData.errors.map((err: any) => err.message);
      throw new Error(validationMessages.join(", "));
    }
    
    throw new Error(errorData.message || "Failed to update user");
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
