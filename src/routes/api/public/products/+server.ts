// src/routes/api/public/products/+server.ts
import { json } from "@sveltejs/kit";
import { getAllProducts } from "$lib/server/productService";
import type { RequestHandler } from "./$types";

// GET: Public endpoint to get all products
export const GET: RequestHandler = async () => {
  try {
    const products = await getAllProducts();
    // Only return necessary fields for public consumption
    const publicProducts = products.map((product) => ({
      id: product.id,
      name: product.name,
      description: product.description,
      baseCode: product.baseCode,
      photo: product.photo,
      categoryId: product.categoryId,
      categoryName: product.category.name,
      variants: product.variants.map((variant) => ({
        id: variant.id,
        variantName: variant.variantName,
        options: variant.options.map((option) => ({
          id: option.id,
          optionName: option.optionName,
          price: option.price,
        })),
      })),
    }));

    return json(publicProducts);
  } catch (error) {
    console.error("Error fetching products:", error);
    return json({ message: "Gagal mengambil data produk" }, { status: 500 });
  }
};
