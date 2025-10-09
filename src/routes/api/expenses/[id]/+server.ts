// src/routes/api/expenses/[id]/+server.ts
import { json, type RequestEvent } from "@sveltejs/kit";
import {
  getExpenseById,
  updateExpense,
  deleteExpense,
} from "$lib/server/expenseService";
import { expenseUpdateSchema } from "$lib/validations/expenseSchema";

export async function GET(event: RequestEvent) {
  try {
    // Only admin and staff can view expenses
    const userRole = event.locals.user?.role;
    if (userRole !== "admin" && userRole !== "staff") {
      throw new Error(
        "Unauthorized: hanya admin dan staff yang dapat mengakses data pengeluaran",
      );
    }

    const id = parseInt(event.params.id);
    if (isNaN(id)) {
      return json({ message: "ID pengeluaran tidak valid" }, { status: 400 });
    }

    const expense = await getExpenseById(id);

    if (!expense) {
      return json({ message: "Pengeluaran tidak ditemukan" }, { status: 404 });
    }

    return json(expense);
  } catch (error) {
    console.error("Error fetching expense:", error);
    return json(
      { message: "Gagal mengambil data pengeluaran" },
      { status: 500 },
    );
  }
}

export async function PUT(event: RequestEvent) {
  try {
    // Only admin and staff can update expenses
    const userRole = event.locals.user?.role;
    if (userRole !== "admin" && userRole !== "staff") {
      throw new Error(
        "Forbidden: hanya admin dan staff yang dapat mengupdate pengeluaran",
      );
    }

    const id = parseInt(event.params.id);
    if (isNaN(id)) {
      return json({ message: "ID pengeluaran tidak valid" }, { status: 400 });
    }

    const body = await event.request.json();
    const parsed = expenseUpdateSchema.safeParse(body);

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

    const updatedExpense = await updateExpense(id, {
      nominal: data.nominal,
      category: data.category,
      date: data.date,
      description:
        data.description !== undefined
          ? data.description || undefined
          : undefined,
      proofFile: data.proofFile
        ? (data.proofFile as unknown as string)
        : undefined, // This is handled via multipart
    });

    return json(updatedExpense);
  } catch (error) {
    console.error("Error updating expense:", error);
    return json({ message: "Gagal mengupdate pengeluaran" }, { status: 500 });
  }
}

export async function DELETE(event: RequestEvent) {
  try {
    // Only admin and staff can delete expenses
    const userRole = event.locals.user?.role;
    if (userRole !== "admin" && userRole !== "staff") {
      throw new Error(
        "Forbidden: hanya admin dan staff yang dapat menghapus pengeluaran",
      );
    }

    const id = parseInt(event.params.id);
    if (isNaN(id)) {
      return json({ message: "ID pengeluaran tidak valid" }, { status: 400 });
    }

    await deleteExpense(id);

    return new Response(null, { status: 204 });
  } catch (error) {
    console.error("Error deleting expense:", error);
    return json({ message: "Gagal menghapus pengeluaran" }, { status: 500 });
  }
}
