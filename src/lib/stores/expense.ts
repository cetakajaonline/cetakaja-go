// src/lib/stores/expense.ts
import { writable } from "svelte/store";
import type { Expense } from "$lib/types";

export const expenses = writable<Expense[]>([]);
export const currentExpense = writable<Expense | null>(null);
export const loading = writable<boolean>(false);
export const error = writable<string | null>(null);
