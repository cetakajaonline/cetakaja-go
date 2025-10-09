// src/routes/api/expenses/multipart/+server.ts
import { json, type RequestEvent } from "@sveltejs/kit";
import { expenseSchema } from "$lib/validations/expenseSchema";
import { createExpense } from "$lib/server/expenseService";
import { saveExpenseFile } from "$lib/server/uploadService";

export async function POST(event: RequestEvent) {
  try {
    // Only admin and staff can create expenses
    const userRole = event.locals.user?.role;
    if (userRole !== "admin" && userRole !== "staff") {
      throw new Error(
        "Forbidden: hanya admin dan staff yang dapat membuat pengeluaran",
      );
    }

    const formData = await event.request.formData();

    // Extract values from form data
    const nominal = Number(formData.get("nominal"));
    const category = formData.get("category") as string;
    const dateString = formData.get("date") as string;
    const description = formData.get("description") as string | null;
    const proofFile = formData.get("proofFile") as File | null;

    // Parse the date
    const date = new Date(dateString);

    // Prepare data for validation
    const rawData = {
      nominal,
      category,
      date,
      description: description || null,
      proofFile: proofFile || null,
    };

    const parsed = expenseSchema.safeParse(rawData);

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

    // Handle file upload if present
    let proofFilePath: string | undefined;
    if (proofFile) {
      const buffer = Buffer.from(await proofFile.arrayBuffer());
      proofFilePath = await saveExpenseFile(buffer, proofFile.name);
    }

    const newExpense = await createExpense({
      nominal: data.nominal,
      category: data.category,
      date: data.date,
      description: data.description || undefined,
      proofFile: proofFilePath,
    });

    return json(newExpense);
  } catch (error) {
    console.error("Error creating expense with file:", error);
    return json({ message: "Gagal membuat pengeluaran" }, { status: 500 });
  }
}
