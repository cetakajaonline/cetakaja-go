import prisma from "$lib/server/prisma";
import type { Prisma } from "@prisma/client";

const itemSelect = {
  id: true,
  name: true,
  desc: true,
  createdAt: true,
} satisfies Prisma.ItemSelect;

export async function getAllItems() {
  return prisma.item.findMany({
    select: itemSelect,
    orderBy: { createdAt: "desc" },
  });
}

export async function getItemById(id: number) {
  return prisma.item.findUnique({
    where: { id },
    select: itemSelect,
  });
}

export async function createItem(data: Prisma.ItemCreateInput) {
  return prisma.item.create({
    data,
    select: itemSelect,
  });
}

export async function updateItem(id: number, data: Prisma.ItemUpdateInput) {
  return prisma.item.update({
    where: { id },
    data,
    select: itemSelect,
  });
}

export async function deleteItem(id: number) {
  return prisma.item.delete({
    where: { id },
  });
}
