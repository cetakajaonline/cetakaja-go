<script lang="ts">
  import DefaultLayout from "$lib/layouts/DefaultLayout.svelte";
  import ProductTable from "$lib/components/ProductTable.svelte";
  import TableToolbar from "$lib/components/TableToolbar.svelte";
  import ProductFormModal from "$lib/components/ProductFormModal.svelte";
  import PageHeader from "$lib/components/PageHeader.svelte";
  import Pagination from "$lib/components/Pagination.svelte";
  import ConfirmModal from "$lib/components/ConfirmModal.svelte";
  import ValidationModal from "$lib/components/ValidationModal.svelte";

  import { products, currentProduct, loading as productLoading, error as productError } from "$lib/stores/product";
  import { productSchema, productUpdateSchema } from "$lib/validations/productSchema";
  import { createProduct, updateProduct, deleteProduct } from "$lib/services/productClient";
  import { z } from "zod";
  import { tick } from "svelte";
  import { onDestroy } from "svelte";
  import type { Product, ProductSortKey } from "$lib/types";
  import type { User } from "@prisma/client";

  export let data: {
    isAdmin: boolean;
    users: User[]; // Keep users as it's still needed for some functionality
  };

  const { isAdmin, users } = data;

  // Initialize the product store with server data from layout
  import { page } from "$app/stores";
  import { onMount } from "svelte";
  import { initializeProductStore } from "$lib/stores/initializer";

  onMount(() => {
    // Get layout data which contains the initial products
    const layoutData = $page.data;
    if (layoutData.products) {
      initializeProductStore(layoutData.products);
    }
  });

  // Subscribe to the products store
  let localProducts: Product[] = [];
  const unsubscribe = products.subscribe((value) => {
    localProducts = value;
  });
  let productToDelete: Product | null = null;
  let selectedProduct: Product | null = null;
  let showProductModal = false;
  let isEditMode = false;
  let currentPage = 1;
  const pageSize = 7;
  const confirmModalId = "delete-product-confirm";
  let searchKeyword = "";
  let sortKey: ProductSortKey = "name";
  let sortDirection: "asc" | "desc" = "asc";

  // Unsubscribe from store on component destroy
  onDestroy(() => {
    unsubscribe();
  });

  let productForm = {
    name: "",
    description: "",
    baseCode: "",
    photo: "",
    categoryId: 0,
    variants: [] as { id?: number; variantName: string; options: { id?: number; optionName: string; price: number; delete?: boolean }[]; delete?: boolean }[],
  };

  let validationMessages: string[] = [];
  let showValidationModal = false;

  function openAddModal() {
    isEditMode = false;
    selectedProduct = null;
    productForm = { 
      name: "", 
      description: "", 
      baseCode: "", 
      photo: "",
      categoryId: 0,
      variants: [] 
    };
    showProductModal = true;
  }

  function openEditModal(product: Product) {
    isEditMode = true;
    selectedProduct = product;
    productForm = {
      name: product.name,
      description: product.description ?? "",
      baseCode: product.baseCode,
      photo: product.photo ?? "",
      categoryId: product.categoryId,
      variants: product.variants.map(v => ({
        id: v.id,
        variantName: v.variantName,
        options: v.options ? v.options.map(opt => ({
          id: opt.id,
          optionName: opt.optionName,
          price: opt.price,
          delete: false
        })) : [],
        delete: false
      }))
    };
    showProductModal = true;
  }

  function closeFormModal() {
    showProductModal = false;
  }

  function closeValidationModal() {
    showValidationModal = false;
    validationMessages = [];
  }

  async function onSubmit(payload: typeof productForm) {
    productLoading.set(true);
    validationMessages = [];

    try {
      const schema = isEditMode ? productUpdateSchema : productSchema;
      const validated = schema.parse(payload);

      let result: Product;
      if (isEditMode && selectedProduct) {
        // When updating, just pass the validated data without manually creating variant objects with missing fields
        const validatedForUpdate = {
          ...validated,
          variants: validated.variants?.map(v => ({
            id: v.id || 0,
            variantName: v.variantName,
            delete: v.delete || false,
            options: v.options ? v.options.map(opt => ({
              id: opt.id || 0,
              optionName: opt.optionName,
              price: opt.price,
              delete: opt.delete || false
            })) : []
            // Don't include createdAt or updatedAt here as they should be managed by the server
          }))
        };
        result = await updateProduct(selectedProduct.id, validatedForUpdate);
        products.update(items => items.map((p) =>
          p.id === selectedProduct!.id ? { ...p, ...result } : p
        ));
      } else {
        // Ensure required fields are present and not undefined
        // Don't include variant objects with createdAt/updatedAt in the create payload
        // The API backend will handle creating the proper variant objects
        const createPayload = {
          name: validated.name ?? "",
          description: validated.description ?? "",
          baseCode: validated.baseCode ?? "",
          photo: validated.photo ?? "",
          categoryId: validated.categoryId ?? 0,
          variants: (validated.variants ?? []).map(v => ({
            // Only include the fields that are actually needed for creating variants
            variantName: v.variantName,
            options: v.options ? v.options.map(opt => ({
              optionName: opt.optionName,
              price: opt.price
            })) : []
            // Don't include id (will be assigned by DB), createdAt, or updatedAt
          }))
        };
        result = await createProduct(createPayload);
        products.update(items => [...items, result]);
      }
      closeFormModal();
    } catch (err) {
      closeFormModal();
      await tick();
      if (err instanceof z.ZodError) {
        validationMessages = err.issues.map((e) => e.message);
      } else if (err instanceof Error) {
        validationMessages = [err.message];
      } else {
        validationMessages = ["Terjadi kesalahan saat mengirim data"];
      }
      showValidationModal = true;
    } finally {
      productLoading.set(false);
    }
  }

  async function onConfirmDelete() {
    if (!productToDelete) return;
    
    try {
      await deleteProduct(productToDelete.id);
      // Only update the UI after successful deletion
      products.update(items => items.filter((p) => p.id !== productToDelete?.id));
    } catch (err) {
      if (err instanceof Error) {
        validationMessages = [err.message];
      } else {
        validationMessages = ["Gagal menghapus produk"];
      }
      showValidationModal = true;
    } finally {
      productToDelete = null;
    }
  }

  function askDelete(product: Product) {
    productToDelete = product;
    setTimeout(() => {
      document.getElementById(confirmModalId)?.click();
    }, 0);
  }

  function handleSearch(keyword: string) {
    searchKeyword = keyword.toLowerCase();
    currentPage = 1;
  }

  function paginate(array: Product[], page: number, size: number) {
    const start = (page - 1) * size;
    return array.slice(start, start + size);
  }

  function toggleSort(key: ProductSortKey) {
    if (sortKey === key) {
      sortDirection = sortDirection === "asc" ? "desc" : "asc";
    } else {
      sortKey = key;
      sortDirection = "asc";
    }
  }

  $: filteredProducts = localProducts.filter(
    (p) =>
      p.name.toLowerCase().includes(searchKeyword) ||
      p.baseCode.toLowerCase().includes(searchKeyword) ||
      p.category?.name.toLowerCase().includes(searchKeyword)
  );

  // Subscribe to loading state
  let localLoading = false;
  const unsubscribeLoading = productLoading.subscribe((value) => {
    localLoading = value;
  });

  onDestroy(() => {
    unsubscribeLoading();
  });

  $: sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortKey === "name") {
      const aVal = a.name ?? "";
      const bVal = b.name ?? "";
      return sortDirection === "asc"
        ? aVal.localeCompare(bVal)
        : bVal.localeCompare(aVal);
    } else if (sortKey === "baseCode") {
      const aVal = a.baseCode ?? "";
      const bVal = b.baseCode ?? "";
      return sortDirection === "asc"
        ? aVal.localeCompare(bVal)
        : bVal.localeCompare(aVal);
    } else if (sortKey === "category.name") {
      const aCatName = a.category?.name || "";
      const bCatName = b.category?.name || "";
      return sortDirection === "asc"
        ? aCatName.localeCompare(bCatName)
        : bCatName.localeCompare(aCatName);
    } else if (sortKey === "createdAt") {
      const aVal = a.createdAt ?? new Date();
      const bVal = b.createdAt ?? new Date();
      if (aVal instanceof Date && bVal instanceof Date) {
        return sortDirection === "asc" 
          ? aVal.getTime() - bVal.getTime() 
          : bVal.getTime() - aVal.getTime();
      }
    }
    return 0;
  });

  $: paginatedProducts = paginate(sortedProducts, currentPage, pageSize);
</script>

<DefaultLayout title="Products">
  <PageHeader
    title="Produk"
    icon="📦"
    showAddButton={isAdmin}
    addLabel="Tambah"
    onAdd={openAddModal}
  />

  <TableToolbar on:search={(e) => handleSearch(e.detail)} />

  <ProductTable
    products={paginatedProducts}
    onEdit={openEditModal}
    onDelete={askDelete}
    onSort={toggleSort}
    {sortKey}
    {sortDirection}
    {isAdmin}
  />

  <Pagination
    totalItems={filteredProducts.length}
    {currentPage}
    {pageSize}
    onPageChange={(p) => (currentPage = p)}
  />

  <ProductFormModal
    show={showProductModal}
    {isEditMode}
    loading={localLoading}
    initial={productForm}
    {isAdmin}
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
      title="Hapus Produk"
      message={`Yakin ingin menghapus ${productToDelete?.name}?`}
      confirmText="Hapus"
      confirmClass="btn-outline btn-error"
      cancelText="Batal"
      cancelClass="btn-outline btn-warning"
      onConfirm={onConfirmDelete}
    />
  {/if}
</DefaultLayout>