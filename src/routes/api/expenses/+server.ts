// src/routes/api/expenses/+server.ts
import { json, type RequestEvent } from "@sveltejs/kit";
import { getAllExpenses, createExpense } from "$lib/server/expenseService";
import { expenseSchema } from "$lib/validations/expenseSchema";

export async function GET(event: RequestEvent) {
  try {
    // Only admin and staff can view expenses
    const userRole = event.locals.user?.role;
    if (userRole !== "admin" && userRole !== "staff") {
      throw new Error(
        "Unauthorized: hanya admin dan staff yang dapat mengakses data pengeluaran",
      );
    }

    const expenses = await getAllExpenses();
    return json(expenses);
  } catch (error) {
    return json(
      { message: "Gagal mengambil data pengeluaran" },
      { status: 500 },
    );
  }
}

export async function POST(event: RequestEvent) {
  try {
    // Only admin and staff can create expenses
    const userRole = event.locals.user?.role;
    if (userRole !== "admin" && userRole !== "staff") {
      throw new Error(
        "Forbidden: hanya admin dan staff yang dapat membuat pengeluaran",
      );
    }

    const body = await event.request.json();
    const parsed = expenseSchema.safeParse(body);

    if (!parsed.success) {
      return json(
        {
          message: "Validasi gagal",
          errors: parsed.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const data = parsed.data;

    const newExpense = await createExpense({
      nominal: data.nominal,
      category: data.category,
      date: data.date,
      description: data.description || undefined,
    });

    return json(newExpense);
  } catch (error) {
    return json({ message: "Gagal membuat pengeluaran" }, { status: 500 });
  }
}

