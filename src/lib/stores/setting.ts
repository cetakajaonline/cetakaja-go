// src/lib/stores/setting.ts
import { writable } from "svelte/store";

export type Setting = {
    appName: string;
    appDesc: string;
    appLogo: string;
};

export const setting = writable<Setting | null>(null);
