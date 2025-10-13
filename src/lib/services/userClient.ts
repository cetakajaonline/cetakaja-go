import type { User } from "$lib/types";
import type { ApiResponse } from "$lib/types";

export async function loginUser(credentials: {
  username: string;
  password: string;
}): Promise<ApiResponse<{ user: User }>> {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(credentials),
  });

  const data: ApiResponse<{ user: User }> = await res.json();
  return data;
}

export async function registerUser(
  userData: Omit<User, "id" | "createdAt"> & { password: string },
): Promise<ApiResponse<User>> {
  const res = await fetch("/api/users", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  });

  const data: ApiResponse<User> = await res.json();
  return data;
}

// Public registration function for self-ordering customers
export async function registerPublicUser(userData: {
  name: string;
  username: string;
  phone: string;
  password: string;
}): Promise<ApiResponse<{ user: User }>> {
  const res = await fetch("/api/auth/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  });

  const data: ApiResponse<{ user: User }> = await res.json();
  return data;
}

export async function createUser(
  userData: Omit<User, "id" | "createdAt" | "updatedAt"> & { password: string },
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
      const validationMessages = errorData.errors.map(
        (err: { message: string }) => err.message,
      );
      throw new Error(validationMessages.join(", "));
    }

    throw new Error(errorData.message || "Failed to create user");
  }

  const responseUser: User = await res.json();
  return responseUser;
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
      const validationMessages = errorData.errors.map(
        (err: { message: string }) => err.message,
      );
      throw new Error(validationMessages.join(", "));
    }

    throw new Error(errorData.message || "Failed to update user");
  }

  const responseUser: User = await res.json();
  return responseUser;
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
