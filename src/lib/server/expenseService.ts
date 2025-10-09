import prisma from "$lib/server/prisma";
import type { Expense } from "$lib/types";

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

export function updateExpense(
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
  if (proofFile !== undefined) data.proofFile = proofFile || null;

  return prisma.expense.update({
    where: { id },
    data,
    select: expenseSelect,
  }) as Promise<Expense>;
}

export function deleteExpense(id: number): Promise<Expense> {
  return prisma.expense.delete({
    where: { id },
    select: expenseSelect,
  }) as Promise<Expense>;
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
