<script lang="ts">
  import DefaultLayout from "$lib/layouts/DefaultLayout.svelte";
  import ItemTable from "$lib/components/ItemTable.svelte";
  import TableToolbar from "$lib/components/TableToolbar.svelte";
  import ItemFormModal from "$lib/components/ItemFormModal.svelte";
  import PageHeader from "$lib/components/PageHeader.svelte";
  import Pagination from "$lib/components/Pagination.svelte";
  import ConfirmModal from "$lib/components/ConfirmModal.svelte";
  import ValidationModal from "$lib/components/ValidationModal.svelte";

  import { z } from "zod";
  import { tick } from "svelte";
  import { itemSchema } from "$lib/validations/itemSchema";
  import type { Item } from "$lib/types";

  export let data: { items: Item[] };

  let items: Item[] = Array.isArray(data?.items) ? data.items : [];

  let itemToDelete: Item | null = null;
  const confirmModalId = "delete-item-confirm";

  let selectedItem: Item | null = null;
  let showItemModal = false;
  let isEditMode = false;
  let loading = false;

  let itemForm = { name: "", desc: "" };
  let validationMessages: string[] = [];
  let showValidationModal = false;

  function openAddModal() {
    isEditMode = false;
    selectedItem = null;
    itemForm = { name: "", desc: "" };
    showItemModal = true;
  }

  function openEditModal(item: Item) {
    isEditMode = true;
    selectedItem = item;
    itemForm = {
      name: item.name,
      desc: item.desc,
    };
    showItemModal = true;
  }

  function closeFormModal() {
    showItemModal = false;
  }

  function closeValidationModal() {
    showValidationModal = false;
    validationMessages = [];
  }

  async function onSubmit(payload: { name: string; desc: string }) {
    loading = true;
    validationMessages = [];

    try {
      const validated = itemSchema.parse(payload);

      const isEdit = isEditMode && selectedItem;
      const res = await fetch(
        isEdit ? `/api/items/${selectedItem!.id}` : "/api/items",
        {
          method: isEdit ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(validated),
        }
      );

      const result = await res.json().catch(() => ({}));

      if (res.ok) {
        if (isEdit) {
          items = items.map((i) =>
            i.id === selectedItem!.id ? { ...i, ...result } : i
          );
        } else {
          items = [...items, result];
        }
        closeFormModal();
      } else {
        closeFormModal();
        await tick();
        validationMessages = [
          result?.message || result?.error || "Gagal menyimpan item",
        ];
        showValidationModal = true;
      }
    } catch (err) {
      closeFormModal();
      await tick();
      if (err instanceof z.ZodError) {
        validationMessages = err.issues.map((e) => e.message);
      } else {
        validationMessages = ["Terjadi kesalahan saat mengirim data"];
      }
      showValidationModal = true;
    } finally {
      loading = false;
    }
  }

  async function onConfirmDelete() {
    if (!itemToDelete) return;

    const res = await fetch(`/api/items/${itemToDelete.id}`, {
      method: "DELETE",
    });

    if (res.ok) {
      items = items.filter((i) => i.id !== itemToDelete!.id);
    } else {
      validationMessages = ["Gagal menghapus item"];
      showValidationModal = true;
    }

    itemToDelete = null;
  }

  function askDelete(item: Item) {
    itemToDelete = item;
    setTimeout(() => {
      document.getElementById(confirmModalId)?.click();
    }, 0);
  }

  // Search, Sort, Pagination
  let searchKeyword = "";
  let currentPage = 1;
  const pageSize = 7;
  let sortKey: keyof Item = "name";
  let sortDirection: "asc" | "desc" = "asc";

  $: filteredItems = items.filter((i) => {
    const keyword = searchKeyword.toLowerCase();
    return (
      (i.name?.toLowerCase() ?? "").includes(keyword) ||
      (i.desc?.toLowerCase() ?? "").includes(keyword)
    );
  });

  $: sortedItems = [...filteredItems].sort((a, b) => {
    const aVal = a[sortKey];
    const bVal = b[sortKey];

    if (typeof aVal === "string" && typeof bVal === "string") {
      return sortDirection === "asc"
        ? aVal.localeCompare(bVal)
        : bVal.localeCompare(aVal);
    }

    return 0;
  });

  $: paginatedItems = paginate(sortedItems, currentPage, pageSize);

  function handleSearch(keyword: string) {
    searchKeyword = keyword.toLowerCase();
    currentPage = 1;
  }

  function toggleSort(field: keyof Item) {
    if (sortKey === field) {
      sortDirection = sortDirection === "asc" ? "desc" : "asc";
    } else {
      sortKey = field;
      sortDirection = "asc";
    }
    currentPage = 1;
  }

  function paginate(array: Item[], page: number, size: number) {
    const start = (page - 1) * size;
    return array.slice(start, start + size);
  }
</script>

<DefaultLayout title="Items">
  <PageHeader
    title="Items"
    icon="📦"
    showAddButton
    addLabel="Tambah"
    onAdd={openAddModal}
  />

  <TableToolbar on:search={(e) => handleSearch(e.detail)} />

  <ItemTable
    items={paginatedItems}
    onEdit={openEditModal}
    onDelete={askDelete}
    onSort={toggleSort}
    {sortKey}
    {sortDirection}
  />

  <Pagination
    totalItems={filteredItems.length}
    {currentPage}
    {pageSize}
    onPageChange={(p) => (currentPage = p)}
  />

  <ItemFormModal
    show={showItemModal}
    {isEditMode}
    {loading}
    initial={itemForm}
    on:submit={(e) => onSubmit(e.detail)}
    on:close={closeFormModal}
  />

  <ValidationModal
    show={showValidationModal}
    title="Validasi Gagal"
    messages={validationMessages}
    onClose={closeValidationModal}
  />

  <ConfirmModal
    id={confirmModalId}
    title="Hapus Item"
    message={`Yakin ingin menghapus item "${itemToDelete?.name ?? ""}"?`}
    confirmText="Hapus"
    confirmClass="btn-outline btn-error"
    cancelText="Batal"
    cancelClass="btn-outline btn-warning"
    onConfirm={onConfirmDelete}
  />
</DefaultLayout>
