import bcrypt from "bcryptjs";
import prisma from "$lib/server/prisma";

const userSelect = {
  id: true,
  name: true,
  email: true,
  photo: true,
  role: true,
  createdAt: true,
};

export async function getAllUsers() {
  return prisma.user.findMany({
    select: userSelect,
    orderBy: { createdAt: "desc" },
  });
}

export async function getUserById(id: number) {
  return prisma.user.findUnique({
    where: { id },
    select: userSelect,
  });
}

export async function getUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email },
  });
}

export async function createUser({
  name,
  email,
  password,
  photo,
  role, // ⬅️ tambahkan ini
}: {
  name: string;
  email: string;
  password: string;
  photo?: string;
  role?: "user" | "admin";
}) {
  const existing = await getUserByEmail(email);
  if (existing) {
    throw new Error("Email sudah terdaftar");
  }

  const hashed = await bcrypt.hash(password, 10);

  return prisma.user.create({
    data: {
      name,
      email,
      password: hashed,
      photo,
      role: role ?? "user", // default 'user' jika tidak ditentukan
    },
    select: userSelect,
  });
}

export async function updateUser(
  id: number,
  {
    name,
    email,
    password,
    photo,
    role, // ⬅️ tambahkan ini
  }: {
    name?: string;
    email?: string;
    password?: string;
    photo?: string;
    role?: "user" | "admin";
  }
) {
  const data: Partial<{
    name: string;
    email: string;
    password: string;
    photo: string;
    role: "user" | "admin";
  }> = {};

  if (name) data.name = name;
  if (email) {
    const existing = await getUserByEmail(email);
    if (existing && existing.id !== id) {
      throw new Error("Email sudah digunakan oleh user lain");
    }
    data.email = email;
  }
  if (photo) data.photo = photo;
  if (password) {
    data.password = await bcrypt.hash(password, 10);
  }
  if (role) {
    data.role = role;
  }

  return prisma.user.update({
    where: { id },
    data,
    select: userSelect,
  });
}

export async function deleteUser(id: number) {
  return prisma.user.delete({
    where: { id },
  });
}

export async function validatePassword(email: string, plainPassword: string) {
  const user = await getUserByEmail(email);
  if (!user) return null;

  const match = await bcrypt.compare(plainPassword, user.password);
  if (!match) return null;

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    photo: user.photo,
    role: user.role,
  };
}
