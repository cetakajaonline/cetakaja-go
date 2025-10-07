import prisma from "$lib/server/prisma";

const categorySelect = {
  id: true,
  name: true,
  code: true,
  description: true,
  createdAt: true,
};

export async function getAllCategories() {
  return prisma.category.findMany({
    select: categorySelect,
    orderBy: { createdAt: "desc" },
  });
}

export async function getCategoryById(id: number) {
  return prisma.category.findUnique({
    where: { id },
    select: categorySelect,
  });
}

export async function getCategoryByCode(code: string) {
  return prisma.category.findUnique({
    where: { code },
    select: categorySelect,
  });
}

export async function createCategory({
  name,
  code,
  description,
}: {
  name: string;
  code: string;
  description?: string;
}) {
  const existing = await getCategoryByCode(code);
  if (existing) {
    throw new Error("Kode kategori sudah terdaftar");
  }

  return prisma.category.create({
    data: {
      name,
      code,
      description: description ?? '',
    },
    select: categorySelect,
  });
}

export async function updateCategory(
  id: number,
  {
    name,
    code,
    description,
  }: {
    name?: string;
    code?: string;
    description?: string;
  },
) {
  const data: Partial<{
    name: string;
    code: string;
    description: string;
  }> = {};

  if (name) data.name = name;
  if (code) {
    const existing = await getCategoryByCode(code);
    if (existing && existing.id !== id) {
      throw new Error("Kode kategori sudah digunakan oleh kategori lain");
    }
    data.code = code;
  }
  if (description !== undefined) data.description = description;

  return prisma.category.update({
    where: { id },
    data,
    select: categorySelect,
  });
}

export async function deleteCategory(id: number) {
  // Check if category has products associated with it
  const products = await prisma.product.findMany({
    where: { categoryId: id },
    select: { id: true }
  });

  if (products.length > 0) {
    throw new Error("Kategori tidak bisa dihapus karena masih memiliki produk terkait");
  }
  
  return prisma.category.delete({
    where: { id },
  });
}