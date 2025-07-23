import prisma from "$lib/server/prisma";

const itemSelect = {
  id: true,
  name: true,
  desc: true,
  createdAt: true,
};

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

export async function createItem({
  name,
  desc,
}: {
  name: string;
  desc: string;
}) {
  return prisma.item.create({
    data: { name, desc },
    select: itemSelect,
  });
}

export async function updateItem(
  id: number,
  data: {
    name?: string;
    desc?: string;
  }
) {
  const updateData: Record<string, any> = {};

  if (typeof data.name !== "undefined") updateData.name = data.name;
  if (typeof data.desc !== "undefined") updateData.desc = data.desc;

  return prisma.item.update({
    where: { id },
    data: updateData,
    select: itemSelect,
  });
}

export async function deleteItem(id: number) {
  return prisma.item.delete({
    where: { id },
  });
}
