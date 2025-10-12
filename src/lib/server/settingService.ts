import prisma from "$lib/server/prisma";
import type { Setting } from "@prisma/client";

export async function getSettings(): Promise<Setting | null> {
  return await prisma.setting.findUnique({ 
    where: { id: 1 },
    select: {
      id: true,
      name: true,
      description: true,
      logo: true,
      bankName: true,
      bankCode: true,
      bankAccountNumber: true,
      bankAccountName: true,
      qrisImage: true,
    }
  });
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


  if (updates.length > 0) {
    const query = `UPDATE "Setting" SET ${updates.join(", ")} WHERE id = $1`;
    await prisma.$executeRawUnsafe(query, 1, ...values);
  }

  // Fetch and return the updated setting
  return await prisma.setting.findUnique({ 
    where: { id: 1 },
    select: {
      id: true,
      name: true,
      description: true,
      logo: true,
      bankName: true,
      bankCode: true,
      bankAccountNumber: true,
      bankAccountName: true,
      qrisImage: true,
    }
  });
}
