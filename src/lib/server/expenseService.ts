import prisma from "$lib/server/prisma";
import type { Expense } from "$lib/types";
import { unlink, access } from "node:fs/promises";
import { join } from "node:path";

// Helper function to check if a file exists
async function fileExists(filePath: string): Promise<boolean> {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

// Define select fields for expense queries
const expenseSelect = {
  id: true,
  nominal: true,
  category: true,
  date: true,
  description: true,
  proofFile: true,
  createdAt: true,
  updatedAt: true,
};

export function getAllExpenses(): Promise<Expense[]> {
  return prisma.expense.findMany({
    select: expenseSelect,
    orderBy: { date: "desc" },
  }) as Promise<Expense[]>;
}

export function getExpenseById(id: number): Promise<Expense | null> {
  return prisma.expense.findUnique({
    where: { id },
    select: expenseSelect,
  }) as Promise<Expense | null>;
}

export function createExpense({
  nominal,
  category,
  date,
  description,
  proofFile,
}: {
  nominal: number;
  category: "operasional" | "marketing" | "gaji" | "lainnya";
  date: Date;
  description?: string;
  proofFile?: string;
}): Promise<Expense> {
  return prisma.expense.create({
    data: {
      nominal,
      category,
      date,
      description: description || null,
      proofFile: proofFile || null,
    },
    select: expenseSelect,
  }) as Promise<Expense>;
}

export async function updateExpense(
  id: number,
  {
    nominal,
    category,
    date,
    description,
    proofFile,
  }: {
    nominal?: number;
    category?: "operasional" | "marketing" | "gaji" | "lainnya";
    date?: Date;
    description?: string;
    proofFile?: string; // This will be the file path for updates
  },
): Promise<Expense> {
  // Get the current expense to access the old proofFile before updating
  const currentExpense = await prisma.expense.findUnique({
    where: { id },
    select: { proofFile: true },
  });

  const data: {
    nominal?: number;
    category?: "operasional" | "marketing" | "gaji" | "lainnya";
    date?: Date;
    description?: string | null;
    proofFile?: string | null;
  } = {};

  if (nominal !== undefined) data.nominal = nominal;
  if (category) data.category = category;
  if (date) data.date = date;
  if (description !== undefined) data.description = description || null;

  // Handle proof file update and delete old file if needed
  if (proofFile !== undefined) {
    data.proofFile = proofFile || null;

    // Delete the old proof file if it exists and a new one is being uploaded
    if (currentExpense?.proofFile && proofFile) {
      try {
        const fullPath = join(
          process.cwd(),
          "static",
          currentExpense.proofFile,
        );
        if (await fileExists(fullPath)) {
          await unlink(fullPath);
        }
      } catch {
        // Continue with the update even if file deletion fails
      }
    }
  }

  return prisma.expense.update({
    where: { id },
    data,
    select: expenseSelect,
  }) as Promise<Expense>;
}

export async function deleteExpense(id: number): Promise<Expense> {
  // Get the expense first to access the proof file before deletion
  const expense = await prisma.expense.findUnique({
    where: { id },
    select: { proofFile: true },
  });

  // Delete the expense record
  const deletedExpense = await prisma.expense.delete({
    where: { id },
    select: expenseSelect,
  });

  // Delete the proof file if it exists
  if (expense?.proofFile) {
    try {
      const fullPath = join(process.cwd(), "static", expense.proofFile);
      if (await fileExists(fullPath)) {
        await unlink(fullPath);
      }
    } catch (error) {
      console.error(
        "Error deleting proof file during expense deletion:",
        error,
      );
      // Continue with the deletion even if file deletion fails
    }
  }

  return deletedExpense as Expense;
}

export async function getTotalExpensesByCategory(
  category: "operasional" | "marketing" | "gaji" | "lainnya",
): Promise<number> {
  const result = await prisma.expense.aggregate({
    where: { category },
    _sum: {
      nominal: true,
    },
  });
  return (result._sum.nominal as number) || 0;
}

export async function getTotalExpensesByDateRange(
  startDate: Date,
  endDate: Date,
): Promise<number> {
  const result = await prisma.expense.aggregate({
    where: {
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
    _sum: {
      nominal: true,
    },
  });
  return (result._sum.nominal as number) || 0;
}
