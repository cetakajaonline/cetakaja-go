// src/lib/stores/setting.ts
import { writable } from "svelte/store";

export type Setting = {
  name: string;
  description: string;
  logo: string | null;
};

export const setting = writable<Setting | null>(null);
