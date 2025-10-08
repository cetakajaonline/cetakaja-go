<script lang="ts">
  import DefaultLayout from "$lib/layouts/DefaultLayout.svelte";
  import CategoryTable from "$lib/components/CategoryTable.svelte";
  import TableToolbar from "$lib/components/TableToolbar.svelte";
  import CategoryFormModal from "$lib/components/CategoryFormModal.svelte";
  import PageHeader from "$lib/components/PageHeader.svelte";
  import Pagination from "$lib/components/Pagination.svelte";
  import ConfirmModal from "$lib/components/ConfirmModal.svelte";
  import ValidationModal from "$lib/components/ValidationModal.svelte";

  import { categorySchema, categoryUpdateSchema } from "$lib/validations/categorySchema";
  import { createCategory, updateCategory, deleteCategory } from "$lib/services/categoryClient";
  import { z } from "zod";
  import { tick } from "svelte";
  import type { Category } from "$lib/types";

  export let data: {
    categories: Category[];
    isAdmin: boolean;
  };

  const { categories: initialCategories, isAdmin } = data;

  let categories = [...initialCategories];
  let categoryToDelete: Category | null = null;
  let selectedCategory: Category | null = null;
  let showCategoryModal = false;
  let isEditMode = false;
  let loading = false;
  let currentPage = 1;
  const pageSize = 7;
  const confirmModalId = "delete-category-confirm";
  let searchKeyword = "";
  let sortKey: keyof Category = "name";
  let sortDirection: "asc" | "desc" = "asc";

  let categoryForm: { name: string; code: string; description: string } = {
    name: "",
    code: "",
    description: "",
  };

  let validationMessages: string[] = [];
  let showValidationModal = false;

  function openAddModal() {
    isEditMode = false;
    selectedCategory = null;
    categoryForm = { name: "", code: "", description: "" };
    showCategoryModal = true;
  }

  function openEditModal(category: Category) {
    isEditMode = true;
    selectedCategory = category;
    categoryForm = {
      name: category.name,
      code: category.code,
      description: category.description ?? "",
    };
    showCategoryModal = true;
  }

  function closeFormModal() {
    showCategoryModal = false;
  }

  function closeValidationModal() {
    showValidationModal = false;
    validationMessages = [];
  }

  async function onSubmit(payload: { name: string; code: string; description: string }) {
    loading = true;
    validationMessages = [];
  
    try {
      const schema = isEditMode ? categoryUpdateSchema : categorySchema;
      const validated = schema.parse(payload);
  
      let result: Category;
      if (isEditMode && selectedCategory) {
        result = await updateCategory(selectedCategory.id, validated);
        categories = categories.map((c) =>
          c.id === selectedCategory!.id ? { ...c, ...result } : c
        );
        // Reset to first page to ensure updated item is visible
        currentPage = 1;
      } else {
        result = await createCategory(validated as Omit<Category, "id" | "createdAt">);
        categories = [...categories, result];
        // Reset to first page to ensure new item is visible
        currentPage = 1;
      }
      closeFormModal();
    } catch (err) {
      closeFormModal();
      await tick();
      try {
        if (err instanceof z.ZodError) {
          validationMessages = err.issues.map((e) => e.message);
        } else if (err instanceof Error) {
          validationMessages = [err.message];
        } else {
          validationMessages = ["Terjadi kesalahan saat mengirim data"];
        }
        showValidationModal = true;
      } catch (uiErr) {
        // If there's an error in the error handling itself, log it
        console.error("UI Error handling failed:", uiErr);
        validationMessages = ["Terjadi kesalahan yang tidak terduga"];
        showValidationModal = true;
      }
    } finally {
      loading = false;
    }
  }

  async function onConfirmDelete() {
    if (!categoryToDelete) return;
    
    try {
      await deleteCategory(categoryToDelete.id);
      categories = categories.filter((c) => c.id !== categoryToDelete?.id);
      // Reset to first page to ensure consistent view after deletion
      currentPage = 1;
    } catch (err) {
      if (err instanceof Error) {
        validationMessages = [err.message];
      } else {
        validationMessages = ["Gagal menghapus kategori"];
      }
      showValidationModal = true;
    } finally {
      categoryToDelete = null;
    }
  }

  function askDelete(category: Category) {
    categoryToDelete = category;
    setTimeout(() => {
      document.getElementById(confirmModalId)?.click();
    }, 0);
  }

  function handleSearch(keyword: string) {
    searchKeyword = keyword.toLowerCase();
    currentPage = 1;
  }

  function paginate(array: Category[], page: number, size: number) {
    const start = (page - 1) * size;
    return array.slice(start, start + size);
  }

  function toggleSort(key: keyof Category) {
    if (sortKey === key) {
      sortDirection = sortDirection === "asc" ? "desc" : "asc";
    } else {
      sortKey = key;
      sortDirection = "asc";
    }
  }

  $: filteredCategories = categories.filter(
    (c) =>
      c.name.toLowerCase().includes(searchKeyword) ||
      c.code.toLowerCase().includes(searchKeyword)
  );

  $: sortedCategories = [...filteredCategories].sort((a, b) => {
    const aVal = a[sortKey] ?? "";
    const bVal = b[sortKey] ?? "";
    if (typeof aVal === "string" && typeof bVal === "string") {
      return sortDirection === "asc"
        ? aVal.localeCompare(bVal)
        : bVal.localeCompare(aVal);
    } else if (aVal instanceof Date && bVal instanceof Date) {
      return sortDirection === "asc" 
        ? aVal.getTime() - bVal.getTime() 
        : bVal.getTime() - aVal.getTime();
    }
    return 0;
  });

  $: paginatedCategories = paginate(sortedCategories, currentPage, pageSize);
</script>

<DefaultLayout title="Categories">
  <PageHeader
    title="Kategori"
    icon="🏷️"
    showAddButton={isAdmin}
    addLabel="Tambah"
    onAdd={openAddModal}
  />

  <TableToolbar on:search={(e) => handleSearch(e.detail)} />

  <CategoryTable
    categories={paginatedCategories}
    onEdit={openEditModal}
    onDelete={askDelete}
    onSort={toggleSort}
    {sortKey}
    {sortDirection}
    {isAdmin}
  />

  <Pagination
    totalItems={filteredCategories.length}
    {currentPage}
    {pageSize}
    onPageChange={(p) => (currentPage = p)}
  />

  <CategoryFormModal
    show={showCategoryModal}
    {isEditMode}
    {loading}
    initial={categoryForm}
    on:submit={(e) => onSubmit(e.detail)}
    on:close={closeFormModal}
  />

  <ValidationModal
    show={showValidationModal}
    title="Validasi Gagal"
    messages={validationMessages}
    onClose={closeValidationModal}
  />

  {#if isAdmin}
    <ConfirmModal
      id={confirmModalId}
      title="Hapus Kategori"
      message={`Yakin ingin menghapus ${categoryToDelete?.name}?`}
      confirmText="Hapus"
      confirmClass="btn-outline btn-error"
      cancelText="Batal"
      cancelClass="btn-outline btn-warning"
      onConfirm={onConfirmDelete}
    />
  {/if}
</DefaultLayout>