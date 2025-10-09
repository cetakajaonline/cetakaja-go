// src/routes/api/expenses/[id]/multipart/+server.ts
import { json, type RequestEvent } from "@sveltejs/kit";
import { expenseUpdateSchema } from "$lib/validations/expenseSchema";
import { updateExpense, getExpenseById } from "$lib/server/expenseService";
import { saveExpenseFile } from "$lib/server/uploadService";

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

    // Check if expense exists
    const existingExpense = await getExpenseById(id);
    if (!existingExpense) {
      return json({ message: "Pengeluaran tidak ditemukan" }, { status: 404 });
    }

    const formData = await event.request.formData();

    // Extract values from form data
    const nominal = formData.get("nominal")
      ? Number(formData.get("nominal"))
      : undefined;
    const category = formData.get("category") as string | undefined;
    const dateString = formData.get("date") as string | undefined;
    const description = formData.get("description") as
      | string
      | null
      | undefined;
    const proofFile = formData.get("proofFile") as File | null;

    // Prepare data for validation
    const rawData: {
      nominal?: number;
      category?: string;
      date?: Date;
      description?: string | null;
      proofFile?: File;
    } = {};
    if (nominal !== undefined) rawData.nominal = nominal;
    if (category) rawData.category = category;
    if (dateString) rawData.date = new Date(dateString);
    if (description !== undefined) rawData.description = description;
    if (proofFile) rawData.proofFile = proofFile;

    // Validate the data
    const parsed = expenseUpdateSchema.safeParse(rawData);

    if (!parsed.success) {
      return json(
        {
          message: "Validasi gagal",
          errors: parsed.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const validatedData = parsed.data;

    // Handle file upload if present
    let proofFilePath: string | undefined;
    if (proofFile) {
      const buffer = Buffer.from(await proofFile.arrayBuffer());
      proofFilePath = await saveExpenseFile(buffer, proofFile.name);
    }

    const updatedExpense = await updateExpense(id, {
      nominal: validatedData.nominal,
      category: validatedData.category as
        | "operasional"
        | "marketing"
        | "gaji"
        | "lainnya",
      date: validatedData.date,
      description:
        validatedData.description !== undefined
          ? validatedData.description || undefined
          : undefined,
      proofFile: proofFilePath,
    });

    return json(updatedExpense);
  } catch (error) {
    console.error("Error updating expense with file:", error);
    return json({ message: "Gagal mengupdate pengeluaran" }, { status: 500 });
  }
}
