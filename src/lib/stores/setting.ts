// src/lib/stores/setting.ts
import { writable } from "svelte/store";

export type Setting = {
  name: string;
  description: string;
  logo?: string | null;
  bankName?: string | null;
  bankCode?: string | null;
  bankAccountNumber?: string | null;
  bankAccountName?: string | null;
  qrisImage?: string | null;
  cashPaymentInstruction?: string | null;
  qrisPaymentInstruction?: string | null;
  bankTransferInstruction?: string | null;
};

export const setting = writable<Setting | null>(null);
