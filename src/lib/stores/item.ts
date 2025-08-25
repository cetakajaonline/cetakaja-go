// src/lib/stores/item.ts
import { writable } from "svelte/store";

export type Item = {
  id: number;
  name: string;
  desc: string;
};

export const item = writable<Item | null>(null);
