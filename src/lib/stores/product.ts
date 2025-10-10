// src/lib/stores/product.ts
import { writable } from "svelte/store";
import type { Product } from "$lib/types";

export const products = writable<Product[]>([]);
export const currentProduct = writable<Product | null>(null);
export const loading = writable<boolean>(false);
export const error = writable<string | null>(null);
