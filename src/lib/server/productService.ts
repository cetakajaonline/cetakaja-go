import prisma from "$lib/server/prisma";
import fs from "fs";
import path from "path";

const productInclude = {
  category: {
    select: {
      id: true,
      name: true,
      code: true,
    },
  },
  variants: {
    select: {
      id: true,
      variantName: true,
      price: true,
      createdAt: true,
      updatedAt: true,
      productId: true,
    },
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
  // Get the current product to access the old photo path before updating
  const currentProduct = await prisma.product.findUnique({
    where: { id },
    select: { photo: true },
  });

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

  const updatedProduct = await prisma.product.update({
    where: { id },
    data,
    include: productInclude,
  });

  // Delete the old photo file if it exists and a new one was uploaded
  if (currentProduct?.photo && photo && currentProduct.photo !== photo) {
    try {
      const fullPath = path.join(process.cwd(), "static", currentProduct.photo);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }
    } catch (err) {
      console.error(
        `Gagal menghapus file foto produk lama: ${currentProduct.photo}`,
        err,
      );
      // Continue even if file deletion fails
    }
  }

  return updatedProduct;
}

export async function deleteProduct(id: number) {
  // Get the current product to access the photo path before deleting
  const currentProduct = await prisma.product.findUnique({
    where: { id },
    select: { photo: true },
  });

  // Check if product has associated order items
  const orderItems = await prisma.orderItem.findMany({
    where: { productId: id },
    select: { id: true },
  });

  if (orderItems.length > 0) {
    throw new Error("Produk tidak bisa dihapus karena memiliki order terkait");
  }

  const deletedProduct = await prisma.product.delete({
    where: { id },
  });

  // Delete the photo file if it exists
  if (currentProduct?.photo) {
    try {
      const fullPath = path.join(process.cwd(), "static", currentProduct.photo);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }
    } catch (err) {
      console.error(
        `Gagal menghapus file foto produk: ${currentProduct.photo}`,
        err,
      );
      // Continue even if file deletion fails
    }
  }

  return deletedProduct;
}
