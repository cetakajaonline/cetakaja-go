import prisma from "$lib/server/prisma";

const productInclude = {
  category: {
    select: {
      id: true,
      name: true,
    },
  },
  variants: {
    orderBy: { createdAt: "asc" as const },
  },
};

export async function getAllProducts() {
  return prisma.product.findMany({
    include: productInclude,
    orderBy: { createdAt: "desc" },
  });
}

export async function getProductById(id: number) {
  return prisma.product.findUnique({
    where: { id },
    include: productInclude,
  });
}

export async function getProductByBaseCode(
  baseCode: string,
  categoryId?: number,
) {
  if (categoryId !== undefined) {
    return prisma.product.findUnique({
      where: {
        baseCode_categoryId: {
          baseCode,
          categoryId,
        },
      },
      include: productInclude,
    });
  } else {
    // Jika categoryId tidak disediakan, cari berdasarkan baseCode saja
    // Ini akan bekerja jika ada indeks unik untuk baseCode
    return prisma.product.findFirst({
      where: { baseCode },
      include: productInclude,
    });
  }
}

export async function createProduct({
  name,
  description,
  baseCode,
  photo,
  categoryId,
  variants,
}: {
  name: string;
  description?: string;
  baseCode: string;
  photo?: string;
  categoryId: number;
  variants: { variantName: string; price: number }[];
}) {
  const existing = await getProductByBaseCode(baseCode, categoryId);
  if (existing) {
    throw new Error("Kode produk sudah terdaftar dalam kategori ini");
  }

  return prisma.product.create({
    data: {
      name,
      description: description ?? "",
      baseCode,
      photo: photo ?? "/uploads/logo.png", // Default to logo.png if not provided
      categoryId,
      variants: {
        create: variants.map((v) => ({
          variantName: v.variantName,
          price: v.price,
        })),
      },
    },
    include: productInclude,
  });
}

export async function updateProduct(
  id: number,
  {
    name,
    description,
    baseCode,
    photo,
    categoryId,
    variants,
  }: {
    name?: string;
    description?: string;
    baseCode?: string;
    photo?: string;
    categoryId?: number;
    variants?: {
      id?: number;
      variantName: string;
      price: number;
      delete?: boolean;
      createdAt?: Date;
    }[];
  },
) {
  // Build update data
  const data: {
    name?: string;
    description?: string;
    baseCode?: string;
    photo?: string;
    categoryId?: number;
    variants?: {
      upsert?: {
        where: { id: number };
        update: { variantName: string; price: number };
        create: { variantName: string; price: number };
      }[];
      create?: { variantName: string; price: number }[];
    };
  } = {};

  if (name) data.name = name;
  if (description !== undefined) data.description = description;
  if (photo !== undefined) data.photo = photo;
  if (baseCode) {
    const existing = await getProductByBaseCode(baseCode, categoryId);
    if (existing && existing.id !== id) {
      throw new Error(
        "Kode produk sudah digunakan oleh produk lain dalam kategori ini",
      );
    }
    data.baseCode = baseCode;
  }
  if (categoryId) data.categoryId = categoryId;

  // Handle variants update
  if (variants) {
    const updateVariants = variants.filter((v) => v.id); // Existing variants to update
    const createVariants = variants.filter((v) => !v.id); // New variants to create
    const deleteVariants = variants.filter((v) => v.delete && v.id); // Variants to delete

    data.variants = {
      upsert: updateVariants.map((v) => ({
        where: { id: v.id! },
        update: {
          variantName: v.variantName,
          price: v.price,
        },
        create: {
          variantName: v.variantName,
          price: v.price,
        },
      })),
      create: createVariants.map((v) => ({
        variantName: v.variantName,
        price: v.price,
      })),
    };

    // Delete variants separately since Prisma's nested delete has limitations
    for (const variant of deleteVariants) {
      if (variant.id) {
        await prisma.productVariant.delete({
          where: { id: variant.id },
        });
      }
    }
  }

  return prisma.product.update({
    where: { id },
    data,
    include: productInclude,
  });
}

export async function deleteProduct(id: number) {
  // Check if product has associated order items
  const orderItems = await prisma.orderItem.findMany({
    where: { productId: id },
    select: { id: true },
  });

  if (orderItems.length > 0) {
    throw new Error("Produk tidak bisa dihapus karena memiliki order terkait");
  }

  return prisma.product.delete({
    where: { id },
  });
}
