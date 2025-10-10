// src/lib/stores/initializer.ts
import { expenses, loading as expenseLoading } from "./expense";
import { orders, loading as orderLoading } from "./order";
import { products, loading as productLoading } from "./product";
import type { Expense, Order, Product } from "$lib/types";

export function initializeExpenseStore(data: Expense[]) {
  expenseLoading.set(false);
  expenses.set(data);
}

export function initializeOrderStore(data: Order[]) {
  orderLoading.set(false);
  orders.set(data);
}

export function initializeProductStore(data: Product[]) {
  productLoading.set(false);
  products.set(data);
}
