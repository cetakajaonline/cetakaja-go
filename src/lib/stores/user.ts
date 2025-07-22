// src/stores/user.ts
import { writable } from "svelte/store";

export type User = {
  id: number;
  name: string;
  email: string;
  photo?: string | null;
};

export const user = writable<User | null>(null);
