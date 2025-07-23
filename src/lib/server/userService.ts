import { error } from "@sveltejs/kit";
import bcrypt from "bcryptjs";
import prisma from "$lib/server/prisma";

export async function getAllUsers() {
  return prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      photo: true,
      role: true, // ⬅️ tambahkan ini
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getUserById(id: number) {
  return prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      photo: true,
      role: true, // ⬅️ tambahkan ini
      createdAt: true,
    },
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
}: {
  name: string;
  email: string;
  password: string;
  photo?: string;
}) {
  const existing = await getUserByEmail(email);
  if (existing) {
    throw error(400, "Email sudah terdaftar");
  }

  const hashed = await bcrypt.hash(password, 10);

  return prisma.user.create({
    data: {
      name,
      email,
      password: hashed,
      photo,
    },
    select: {
      id: true,
      name: true,
      email: true,
      photo: true,
      role: true, // ⬅️ tambahkan ini
      createdAt: true,
    },
  });
}

export async function updateUser(
  id: number,
  {
    name,
    email,
    password,
    photo,
  }: {
    name?: string;
    email?: string;
    password?: string;
    photo?: string;
  }
) {
  const data: Partial<{
    name: string;
    email: string;
    password: string;
    photo: string;
  }> = {};

  if (name) data.name = name;
  if (email) {
    const existing = await getUserByEmail(email);
    if (existing && existing.id !== id) {
      throw error(400, "Email sudah digunakan oleh user lain");
    }
    data.email = email;
  }
  if (photo) data.photo = photo;
  if (password) {
    data.password = await bcrypt.hash(password, 10);
  }

  return prisma.user.update({
    where: { id },
    data,
    select: {
      id: true,
      name: true,
      email: true,
      photo: true,
      role: true, // ⬅️ tambahkan ini
      createdAt: true,
    },
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
    role: user.role, // ⬅️ tambahkan ini
  };
}
