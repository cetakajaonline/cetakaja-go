// src/lib/stores/category.ts
import { writable } from "svelte/store";
import type { Category } from "$lib/types";

export const categories = writable<Category[]>([]);
export const currentCategory = writable<Category | null>(null);
export const loading = writable<boolean>(false);
export const error = writable<string | null>(null);
