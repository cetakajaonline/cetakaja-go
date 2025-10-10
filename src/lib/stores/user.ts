// src/lib/stores/user.ts
import { writable } from "svelte/store";

export type User = {
  id: number;
  name: string;
  username: string;
  phone: string;
  address: string | null;
  role?: string;
  createdAt: Date | string; // Could be Date or ISO string from SvelteKit
};

export const user = writable<User | null>(null);
