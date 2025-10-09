<script lang="ts">
  import DefaultLayout from "$lib/layouts/DefaultLayout.svelte";
  import ExpenseTable from "$lib/components/ExpenseTable.svelte";
  import TableToolbar from "$lib/components/TableToolbar.svelte";
  import ExpenseFormModal from "$lib/components/ExpenseFormModal.svelte";
  import ExpenseDetailModal from "$lib/components/ExpenseDetailModal.svelte";
  import PageHeader from "$lib/components/PageHeader.svelte";
  import Pagination from "$lib/components/Pagination.svelte";
  import ConfirmModal from "$lib/components/ConfirmModal.svelte";
  import ValidationModal from "$lib/components/ValidationModal.svelte";

  import { expenseSchema, expenseUpdateSchema } from "$lib/validations/expenseSchema";
  import { createExpense, updateExpense, deleteExpense, getExpense } from "$lib/services/expenseClient";
  import { z } from "zod";
  import { tick } from "svelte";
  import type { Expense } from "$lib/types";

  export let data: {
    expenses: Expense[];
    isAdmin: boolean;
    isStaff: boolean;
  };

  const { expenses: initialExpenses, isAdmin, isStaff } = data;

  let expenses = [...initialExpenses];
  let expenseToDelete: Expense | null = null;
  let selectedExpense: Expense | null = null;
  let selectedExpenseDetail: Expense | null = null;
  let showExpenseModal = false;
  let showExpenseDetailModal = false;
  let isEditMode = false;
  let loading = false;
  let currentPage = 1;
  const pageSize = 7;
  const confirmModalId = "delete-expense-confirm";
  let searchKeyword = "";
  let sortKey: keyof Expense = "date";
  let sortDirection: "asc" | "desc" = "desc"; // Default to descending for latest expenses

  let expenseForm = {
    nominal: 0,
    category: "operasional" as "operasional" | "marketing" | "gaji" | "lainnya",
    date: new Date(),
    description: "",
    proofFile: null as File | null,
  };

  let validationMessages: string[] = [];
  let showValidationModal = false;

  function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }

  function formatCategory(category: string): string {
    const categoryMap: Record<string, string> = {
      operasional: "Operasional",
      marketing: "Marketing",
      gaji: "Gaji",
      lainnya: "Lainnya"
    };
    return categoryMap[category] || category;
  }

  async function openAddModal() {
    isEditMode = false;
    selectedExpense = null;
    
    expenseForm = {
      nominal: 0,
      category: "operasional",
      date: new Date(),
      description: "",
      proofFile: null,
    };
    showExpenseModal = true;
  }

  function openEditModal(expense: Expense) {
    isEditMode = true;
    selectedExpense = expense;
    expenseForm = {
      nominal: expense.nominal,
      category: expense.category as "operasional" | "marketing" | "gaji" | "lainnya",
      date: new Date(expense.date),
      description: expense.description ?? "",
      proofFile: null, // Don't prefill the file input
    };
    showExpenseModal = true;
  }

  function closeFormModal() {
    showExpenseModal = false;
  }

  function closeValidationModal() {
    showValidationModal = false;
    validationMessages = [];
  }

  async function onSubmit(payload: typeof expenseForm) {
    loading = true;
    validationMessages = [];

    try {
      let result: Expense;

      if (isEditMode && selectedExpense) {
        // Update expense
        result = await updateExpense(selectedExpense.id, { ...payload });
        expenses = expenses.map((e) =>
          e.id === selectedExpense!.id ? { ...e, ...result } : e
        );
      } else {
        // Create expense
        const validated = expenseSchema.parse(payload);
        result = await createExpense({ ...validated });
        expenses = [...expenses, result];
      }
      closeFormModal();
    } catch (err) {
      closeFormModal();
      await tick();
      if (err instanceof z.ZodError) {
        validationMessages = err.issues.map((e: { message: string }) => e.message);
      } else if (err instanceof Error) {
        validationMessages = [err.message];
      } else {
        validationMessages = ["Terjadi kesalahan saat mengirim data"];
      }
      showValidationModal = true;
    } finally {
      loading = false;
    }
  }

  async function onConfirmDelete() {
    if (!expenseToDelete) return;
    
    try {
      const success = await deleteExpense(expenseToDelete.id);
      if (success) {
        expenses = expenses.filter((e) => e.id !== expenseToDelete?.id);
      }
    } catch (err) {
      // Handle error silently or show in UI if needed
      console.error("Failed to delete expense:", err);
    } finally {
      expenseToDelete = null;
    }
  }

  function askDelete(expense: Expense) {
    expenseToDelete = expense;
    setTimeout(() => {
      document.getElementById(confirmModalId)?.click();
    }, 0);
  }

  async function openDetailModal(expense: Expense) {
    try {
      // Fetch detailed expense information
      const detailedExpense = await getExpense(expense.id);
      selectedExpenseDetail = detailedExpense;
      showExpenseDetailModal = true;
    } catch (error) {
      console.error('Error fetching detailed expense:', error);
      // Fallback to the basic expense if detailed fetch fails
      selectedExpenseDetail = expense;
      showExpenseDetailModal = true;
    }
  }

  function closeDetailModal() {
    showExpenseDetailModal = false;
  }

  function handleSearch(keyword: string) {
    searchKeyword = keyword.toLowerCase();
    currentPage = 1;
  }

  function paginate(array: Expense[], page: number, size: number) {
    const start = (page - 1) * size;
    return array.slice(start, start + size);
  }

  function toggleSort(key: keyof Expense) {
    if (sortKey === key) {
      sortDirection = sortDirection === "asc" ? "desc" : "asc";
    } else {
      sortKey = key;
      sortDirection = "asc";
    }
  }

  $: filteredExpenses = expenses.filter(
    (e) =>
      e.category.toLowerCase().includes(searchKeyword) ||
      e.description?.toLowerCase().includes(searchKeyword) || 
      formatCurrency(e.nominal).toLowerCase().includes(searchKeyword)
  );

  $: sortedExpenses = [...filteredExpenses].sort((a, b) => {
    const aVal = a[sortKey] ?? "";
    const bVal = b[sortKey] ?? "";
    if (typeof aVal === "string" && typeof bVal === "string") {
      return sortDirection === "asc"
        ? aVal.localeCompare(bVal)
        : bVal.localeCompare(aVal);
    } else if (aVal instanceof Date && bVal instanceof Date) {
      return sortDirection === "asc" 
        ? (aVal as any) - (bVal as any) 
        : (bVal as any) - (aVal as any);
    } else if (typeof aVal === "number" && typeof bVal === "number") {
      return sortDirection === "asc" ? aVal - bVal : bVal - aVal;
    }
    return 0;
  });

  $: paginatedExpenses = paginate(sortedExpenses, currentPage, pageSize);
</script>

<DefaultLayout title="Expenses">
  <PageHeader
    title="Expenses"
    icon="💰"
    showAddButton={isAdmin || isStaff}
    addLabel="Tambah"
    onAdd={openAddModal}
  />

  <TableToolbar on:search={(e: CustomEvent<string>) => handleSearch(e.detail)} />

  <ExpenseTable
    expenses={paginatedExpenses}
    onEdit={openEditModal}
    onDelete={(expense) => (isAdmin || isStaff) && askDelete(expense)}
    onDetail={openDetailModal}
    onSort={toggleSort}
    {sortKey}
    {sortDirection}
    {isAdmin}
    {isStaff}
  />

  <Pagination
    totalItems={filteredExpenses.length}
    {currentPage}
    {pageSize}
    onPageChange={(p) => (currentPage = p)}
  />

  <ExpenseFormModal
    show={showExpenseModal}
    {isEditMode}
    {loading}
    initial={expenseForm}
    on:submit={(e: CustomEvent<typeof expenseForm>) => onSubmit(e.detail)}
    on:close={closeFormModal}
  />

  <ValidationModal
    show={showValidationModal}
    title="Validasi Gagal"
    messages={validationMessages}
    onClose={closeValidationModal}
  />

  <ExpenseDetailModal
    show={showExpenseDetailModal}
    expense={selectedExpenseDetail}
    onClose={closeDetailModal}
    {formatCurrency}
    {formatCategory}
  />

  {#if isAdmin || isStaff}
    <ConfirmModal
      id={confirmModalId}
      title="Hapus Pengeluaran"
      message={`Yakin ingin menghapus pengeluaran ${formatCurrency(expenseToDelete?.nominal || 0)}?`}
      confirmText="Hapus"
      confirmClass="btn-outline btn-error"
      cancelText="Batal"
      cancelClass="btn-outline btn-warning"
      onConfirm={onConfirmDelete}
    />
  {/if}
</DefaultLayout>