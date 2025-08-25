// src/lib/stores/key.ts
import { writable } from "svelte/store";

export type Key = {
  id: number;
  name: string;
  token: string;
  createdAt: string;
  revoked: boolean;
};

export const key = writable<Key | null>(null);
