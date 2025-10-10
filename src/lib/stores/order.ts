// src/lib/stores/order.ts
import { writable } from "svelte/store";
import type { Order } from "$lib/types";

export const orders = writable<Order[]>([]);
export const currentOrder = writable<Order | null>(null);
export const loading = writable<boolean>(false);
export const error = writable<string | null>(null);
