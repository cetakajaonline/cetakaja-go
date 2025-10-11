import prisma from "$lib/server/prisma";
import type { Setting } from "@prisma/client";

export async function getSettings(): Promise<Setting | null> {
  return await prisma.setting.findUnique({ where: { id: 1 } });
}

// Using a flexible approach to handle both old and new fields
interface SettingUpdateData {
  name?: string;
  description?: string;
  logo?: string | null;
  bankName?: string | null;
  bankCode?: string | null;
  bankAccountNumber?: string | null;
  bankAccountName?: string | null;
  qrisImage?: string | null;
  cashPaymentInstruction?: string | null;
  qrisPaymentInstruction?: string | null;
  bankTransferInstruction?: string | null;
  [key: string]: unknown;
}

export async function updateSetting(data: SettingUpdateData) {
  // Use raw SQL to update all fields at once, bypassing Prisma validation
  const updates = [];
  const values = [];
  let paramIndex = 2; // Start from $2 as $1 will be the id

  // Add all fields that might be in the data object
  if ("name" in data && data.name !== undefined) {
    updates.push(`"name" = $${paramIndex}`);
    values.push(data.name);
    paramIndex++;
  }
  if ("description" in data && data.description !== undefined) {
    updates.push(`"description" = $${paramIndex}`);
    values.push(data.description);
    paramIndex++;
  }
  if ("logo" in data && data.logo !== undefined) {
    updates.push(`"logo" = $${paramIndex}`);
    values.push(data.logo);
    paramIndex++;
  }
  if ("bankName" in data && data.bankName !== undefined) {
    updates.push(`"bankName" = $${paramIndex}`);
    values.push(data.bankName);
    paramIndex++;
  }
  if ("bankCode" in data && data.bankCode !== undefined) {
    updates.push(`"bankCode" = $${paramIndex}`);
    values.push(data.bankCode);
    paramIndex++;
  }
  if ("bankAccountNumber" in data && data.bankAccountNumber !== undefined) {
    updates.push(`"bankAccountNumber" = $${paramIndex}`);
    values.push(data.bankAccountNumber);
    paramIndex++;
  }
  if ("bankAccountName" in data && data.bankAccountName !== undefined) {
    updates.push(`"bankAccountName" = $${paramIndex}`);
    values.push(data.bankAccountName);
    paramIndex++;
  }
  if ("qrisImage" in data && data.qrisImage !== undefined) {
    updates.push(`"qrisImage" = $${paramIndex}`);
    values.push(data.qrisImage);
    paramIndex++;
  }
  if (
    "cashPaymentInstruction" in data &&
    data.cashPaymentInstruction !== undefined
  ) {
    updates.push(`"cashPaymentInstruction" = $${paramIndex}`);
    values.push(data.cashPaymentInstruction);
    paramIndex++;
  }
  if (
    "qrisPaymentInstruction" in data &&
    data.qrisPaymentInstruction !== undefined
  ) {
    updates.push(`"qrisPaymentInstruction" = $${paramIndex}`);
    values.push(data.qrisPaymentInstruction);
    paramIndex++;
  }
  if (
    "bankTransferInstruction" in data &&
    data.bankTransferInstruction !== undefined
  ) {
    updates.push(`"bankTransferInstruction" = $${paramIndex}`);
    values.push(data.bankTransferInstruction);
    paramIndex++;
  }

  if (updates.length > 0) {
    const query = `UPDATE "Setting" SET ${updates.join(", ")} WHERE id = $1`;
    await prisma.$executeRawUnsafe(query, 1, ...values);
  }

  // Fetch and return the updated setting
  return await prisma.setting.findUnique({ where: { id: 1 } });
}
