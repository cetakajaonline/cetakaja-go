import type { Expense } from "$lib/types";

// Define types for expense creation (with required fields)
interface ExpenseCreationData {
  nominal: number; // Required: amount of the expense
  category: "operasional" | "marketing" | "gaji" | "lainnya"; // Required: category of the expense
  date: Date; // Required: date of the expense
  description?: string; // Optional: description
  proofFile?: File | null; // Optional: file to upload as proof
}

// Define types for expense update (with optional fields)
interface ExpenseUpdateData {
  nominal?: number; // Optional: amount of the expense
  category?: "operasional" | "marketing" | "gaji" | "lainnya"; // Optional: category of the expense
  date?: Date; // Optional: date of the expense
  description?: string; // Optional: description
  proofFile?: File | null; // Optional: file to upload as proof
}

export async function createExpense(
  expenseData: Omit<ExpenseCreationData, "proofFile"> & {
    proofFile?: File | null;
  },
): Promise<Expense> {
  // Check if proof file is being included
  if (expenseData.proofFile instanceof File) {
    // Use multipart endpoint to handle file uploads along with expense data
    const formData = new FormData();

    // Add basic expense data
    formData.append("nominal", expenseData.nominal.toString());
    formData.append("category", expenseData.category);
    // Ensure date is a Date object before calling toISOString
    const dateValue = expenseData.date instanceof Date 
      ? expenseData.date.toISOString() 
      : new Date(expenseData.date).toISOString();
    formData.append("date", dateValue);
    if (expenseData.description)
      formData.append("description", expenseData.description);

    // Add proof file
    formData.append("proofFile", expenseData.proofFile);

    const res = await fetch("/api/expenses/multipart", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || "Failed to create expense");
    }

    const result: Expense = await res.json();
    return result;
  } else {
    // Use regular JSON endpoint for expenses without file uploads
    const expenseDataWithoutFile = { ...expenseData };
    delete expenseDataWithoutFile.proofFile;

    const res = await fetch("/api/expenses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(expenseDataWithoutFile),
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || "Failed to create expense");
    }

    const result: Expense = await res.json();
    return result;
  }
}

export async function updateExpense(
  id: number,
  expenseData: Partial<Omit<ExpenseUpdateData, "proofFile">> & {
    proofFile?: File | null;
  },
): Promise<Expense> {
  // Check if proof file is being included
  if (expenseData.proofFile instanceof File) {
    // Use multipart endpoint to handle file uploads along with expense data
    const formData = new FormData();

    // Add all data fields
    if (expenseData.nominal)
      formData.append("nominal", expenseData.nominal.toString());
    if (expenseData.category) formData.append("category", expenseData.category);
    if (expenseData.date) {
      // Ensure date is a Date object before calling toISOString
      const dateValue = expenseData.date instanceof Date 
        ? expenseData.date.toISOString() 
        : new Date(expenseData.date).toISOString();
      formData.append("date", dateValue);
    }
    if (expenseData.description !== undefined)
      formData.append("description", expenseData.description);

    // Add proof file
    formData.append("proofFile", expenseData.proofFile);

    const res = await fetch(`/api/expenses/${id}/multipart`, {
      method: "PUT",
      body: formData,
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || "Failed to update expense");
    }

    const result: Expense = await res.json();
    return result;
  } else {
    // Use regular JSON endpoint for expenses without file uploads
    const expenseDataWithoutFile = { ...expenseData };
    delete expenseDataWithoutFile.proofFile;

    const res = await fetch(`/api/expenses/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(expenseDataWithoutFile),
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || "Failed to update expense");
    }

    const result: Expense = await res.json();
    return result;
  }
}

export async function deleteExpense(id: number): Promise<boolean> {
  const res = await fetch(`/api/expenses/${id}`, {
    method: "DELETE",
  });

  return res.ok;
}

export async function getExpense(id: number): Promise<Expense> {
  const res = await fetch(`/api/expenses/${id}`);

  if (!res.ok) {
    throw new Error("Failed to fetch expense");
  }

  const result: Expense = await res.json();
  return result;
}

export async function getAllExpenses(): Promise<Expense[]> {
  const res = await fetch("/api/expenses");

  if (!res.ok) {
    throw new Error("Failed to fetch expenses");
  }

  const result: Expense[] = await res.json();
  return result;
}
