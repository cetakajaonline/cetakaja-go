import bcrypt from "bcryptjs";
import prisma from "$lib/server/prisma";

const userSelect = {
  id: true,
  name: true,
  username: true,
  phone: true,
  address: true,
  role: true,
  createdAt: true,
  updatedAt: true,
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

export async function getUserByUsername(username: string) {
  return prisma.user.findUnique({
    where: { username },
    select: userSelect,
  });
}

export async function createUser({
  name,
  username,
  password,
  phone,
  address,
  role, // ⬅️ tambahkan ini
}: {
  name: string;
  username: string;
  password: string;
  phone?: string;
  address?: string;
  role?: "admin" | "staff" | "customer";
}) {
  const existing = await getUserByUsername(username);
  if (existing) {
    throw new Error("Username sudah terdaftar");
  }

  const hashed = await bcrypt.hash(password, 10);

  return prisma.user.create({
    data: {
      name,
      username,
      password: hashed,
      phone: phone ?? "",
      address: address ?? "",
      role: role ?? "customer", // default 'customer' jika tidak ditentukan
    },
    select: userSelect,
  });
}

export async function updateUser(
  id: number,
  {
    name,
    username,
    password,
    phone,
    address,
    role, // ⬅️ tambahkan ini
  }: {
    name?: string;
    username?: string;
    password?: string;
    phone?: string;
    address?: string;
    role?: "admin" | "staff" | "customer";
  },
) {
  const data: Partial<{
    name: string;
    username: string;
    password: string;
    phone: string;
    address: string;
    role: "admin" | "staff" | "customer";
  }> = {};

  if (name) data.name = name;
  if (username) {
    const existing = await getUserByUsername(username);
    if (existing && existing.id !== id) {
      throw new Error("Username sudah digunakan oleh user lain");
    }
    data.username = username;
  }
  if (password) {
    data.password = await bcrypt.hash(password, 10);
  }
  if (phone) data.phone = phone;
  if (address) data.address = address;
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

export async function validatePassword(
  username: string,
  plainPassword: string,
) {
  const user = await prisma.user.findUnique({
    where: { username },
    select: {
      id: true,
      name: true,
      username: true,
      password: true, // Ambil password hanya untuk validasi
      phone: true,
      address: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) return null;

  const match = await bcrypt.compare(plainPassword, user.password);
  if (!match) return null;

  // For security, only return essential user data after successful validation
  return {
    id: user.id,
    name: user.name,
    username: user.username,
    role: user.role,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}
