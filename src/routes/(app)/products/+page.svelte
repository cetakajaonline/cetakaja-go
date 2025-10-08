<script lang="ts">
  import DefaultLayout from "$lib/layouts/DefaultLayout.svelte";
  import ProductTable from "$lib/components/ProductTable.svelte";
  import TableToolbar from "$lib/components/TableToolbar.svelte";
  import ProductFormModal from "$lib/components/ProductFormModal.svelte";
  import PageHeader from "$lib/components/PageHeader.svelte";
  import Pagination from "$lib/components/Pagination.svelte";
  import ConfirmModal from "$lib/components/ConfirmModal.svelte";
  import ValidationModal from "$lib/components/ValidationModal.svelte";

  import { productSchema, productUpdateSchema } from "$lib/validations/productSchema";
  import { createProduct, updateProduct, deleteProduct } from "$lib/services/productClient";
  import { z } from "zod";
  import { tick } from "svelte";
  import type { Product, ProductSortKey } from "$lib/types";

  export let data: {
    products: Product[];
    isAdmin: boolean;
  };

  const { products: initialProducts, isAdmin } = data;

  let products = [...initialProducts];
  let productToDelete: Product | null = null;
  let selectedProduct: Product | null = null;
  let showProductModal = false;
  let isEditMode = false;
  let loading = false;
  let currentPage = 1;
  const pageSize = 7;
  const confirmModalId = "delete-product-confirm";
  let searchKeyword = "";
  let sortKey: ProductSortKey = "name";
  let sortDirection: "asc" | "desc" = "asc";

  let productForm = {
    name: "",
    description: "",
    baseCode: "",
    photo: "",
    categoryId: 0,
    variants: [{ variantName: '', price: 0 }] as { id?: number; variantName: string; price: number; delete?: boolean; createdAt?: Date }[],
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
      variants: [{ variantName: '', price: 0 }] 
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
        price: v.price
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
    loading = true;
    validationMessages = [];

    try {
      const schema = isEditMode ? productUpdateSchema : productSchema;
      const validated = schema.parse(payload);

      let result: Product;
      if (isEditMode && selectedProduct) {
        const validatedWithCreatedAt = {
          ...validated,
          variants: validated.variants?.map(v => {
            // For update, if id exists, use it; if creating new, id will be 0 (handled by Prisma)
            // Adding createdAt with a default value to match ProductVariant interface
            return {
              id: v.id || 0,
              variantName: v.variantName,
              price: v.price,
              createdAt: new Date() // Provide a default value for createdAt
            };
          })
        };
        result = await updateProduct(selectedProduct.id, validatedWithCreatedAt);
        products = products.map((p) =>
          p.id === selectedProduct!.id ? { ...p, ...result } : p
        );
      } else {
        // Ensure required fields are present and not undefined
        const createPayload = {
          name: validated.name ?? "",
          description: validated.description ?? "",
          baseCode: validated.baseCode ?? "",
          photo: validated.photo ?? "",
          categoryId: validated.categoryId ?? 0,
          variants: (validated.variants ?? []).map(v => ({
            id: 0, // Placeholder ID untuk variant baru
            variantName: v.variantName,
            price: v.price,
            createdAt: new Date(), // Tambahkan createdAt untuk variant baru
            updatedAt: new Date()
          }))
        };
        result = await createProduct(createPayload);
        products = [...products, result];
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
      loading = false;
    }
  }

  async function onConfirmDelete() {
    if (!productToDelete) return;
    
    try {
      await deleteProduct(productToDelete.id);
      products = products.filter((p) => p.id !== productToDelete?.id);
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

  $: filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchKeyword) ||
      p.baseCode.toLowerCase().includes(searchKeyword) ||
      p.category?.name.toLowerCase().includes(searchKeyword)
  );

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
    {loading}
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