<script lang="ts">
  import DefaultLayout from "$lib/layouts/DefaultLayout.svelte";
  import OrderTable from "$lib/components/OrderTable.svelte";
  import TableToolbar from "$lib/components/TableToolbar.svelte";
  import OrderFormModal from "$lib/components/OrderFormModal.svelte";
  import OrderDetailModal from "$lib/components/OrderDetailModal.svelte";
  import PageHeader from "$lib/components/PageHeader.svelte";
  import Pagination from "$lib/components/Pagination.svelte";
  import ConfirmModal from "$lib/components/ConfirmModal.svelte";
  import ValidationModal from "$lib/components/ValidationModal.svelte";

  import { orderSchema } from "$lib/validations/orderSchema";
  import { createOrder, updateOrder, deleteOrder, getOrder, getNextOrderNumber } from "$lib/services/orderClient";
  import { z } from "zod";
  import { tick } from "svelte";
  import type { Order, User, Product } from "$lib/types";

  export let data: {
    orders: Order[];
    users: User[];
    products: Product[];
    isAdmin: boolean;
    isStaff: boolean;
  };

  const { orders: initialOrders, users, products, isAdmin, isStaff } = data;

  let orders = [...initialOrders];
  let orderToDelete: Order | null = null;
  let selectedOrder: Order | null = null;
  let selectedOrderDetail: Order | null = null;
  let showOrderModal = false;
  let showOrderDetailModal = false;
  let isEditMode = false;
  let loading = false;
  let currentPage = 1;
  const pageSize = 7;
  const confirmModalId = "delete-order-confirm";
  let searchKeyword = "";
  let sortKey: keyof Order = "createdAt";
  let sortDirection: "asc" | "desc" = "desc"; // Default to descending for latest orders

  let orderForm = {
    userId: 0,
    orderNumber: "",
    status: "pending" as "pending" | "processing" | "finished" | "canceled",
    shippingMethod: "pickup" as "pickup" | "delivery",
    paymentMethod: "transfer" as "transfer" | "qris" | "cash",
    paymentStatus: "pending" as "pending" | "confirmed" | "failed" | "refunded",
    notes: "",
    totalAmount: 0,
    paymentProofFile: undefined as File | undefined,
    orderItems: [] as {
      productId: number;
      variantId?: number;
      qty: number;
      price: number;
      subtotal: number;
    }[],
  };

  let validationMessages: string[] = [];
  let showValidationModal = false;

  async function generateOrderNumber() {
    try {
      // Get the next order number from the server
      const nextOrderNumber = await getNextOrderNumber();
      return nextOrderNumber;
    } catch (error) {
      console.error("Failed to generate order number:", error);
      // Fallback to a timestamp-based number if API fails
      const now = new Date();
      const year = now.getFullYear().toString().slice(-2);
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const timestamp = String(Math.floor(Date.now() / 1000) % 10000).padStart(4, '0');
      return `ORD-${year}${month}${day}-${timestamp}`;
    }
  }

  async function openAddModal() {
    isEditMode = false;
    selectedOrder = null;
    
    const newOrderNumber = await generateOrderNumber();
    
    orderForm = {
      userId: 0,
      orderNumber: newOrderNumber,
      status: "pending" as "pending" | "processing" | "finished" | "canceled",
      shippingMethod: "pickup" as "pickup" | "delivery",
      paymentMethod: "transfer" as "transfer" | "qris" | "cash",
      paymentStatus: "pending" as "pending" | "confirmed" | "failed" | "refunded",
      notes: "",
      totalAmount: 0,
      paymentProofFile: undefined,
      orderItems: [],
    };
    showOrderModal = true;
  }

  function openEditModal(order: Order) {
    isEditMode = true;
    selectedOrder = order;
    orderForm = {
      userId: order.userId,
      orderNumber: order.orderNumber,
      status: order.status as "pending" | "processing" | "finished" | "canceled",
      shippingMethod: order.shippingMethod as "pickup" | "delivery",
      paymentMethod: order.paymentMethod as "transfer" | "qris" | "cash",
      paymentStatus: order.paymentStatus as "pending" | "confirmed" | "failed" | "refunded",
      notes: order.notes ?? "",
      totalAmount: order.totalAmount,
      paymentProofFile: undefined,
      orderItems: order.orderItems.map(item => ({
        productId: item.productId,
        variantId: item.variantId || undefined,
        qty: item.qty,
        price: item.price,
        subtotal: item.subtotal,
      })),
    };
    showOrderModal = true;
  }

  function closeFormModal() {
    showOrderModal = false;
  }

  function closeValidationModal() {
    showValidationModal = false;
    validationMessages = [];
  }

  async function onSubmit(payload: typeof orderForm) {
    loading = true;
    validationMessages = [];

    try {
      let result: Order;
      const orderData = payload;

      if (isEditMode && selectedOrder) {
        // Update order (payment proof handling would be separate)
        result = await updateOrder(selectedOrder.id, orderData);
        orders = orders.map((o) =>
          o.id === selectedOrder!.id ? { ...o, ...result } : o
        );
      } else {
        // Create order - extract paymentProofFile before validation to preserve it
        const { paymentProofFile, ...orderDataWithoutFile } = orderData;
        const validated = orderSchema.parse(orderDataWithoutFile);
        
        // Re-add the paymentProofFile to the validated data
        result = await createOrder({ 
          ...validated, 
          ...(paymentProofFile && { paymentProofFile }) 
        });
        orders = [...orders, result];
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
    if (!orderToDelete) return;
    
    try {
      const success = await deleteOrder(orderToDelete.id);
      if (success) {
        orders = orders.filter((o) => o.id !== orderToDelete?.id);
      }
    } catch (err) {
      // Handle error silently or show in UI if needed
      console.error("Failed to delete order:", err);
    } finally {
      orderToDelete = null;
    }
  }

  function askDelete(order: Order) {
    orderToDelete = order;
    setTimeout(() => {
      document.getElementById(confirmModalId)?.click();
    }, 0);
  }

  async function openDetailModal(order: Order) {
    try {
      // Fetch detailed order information including payments and payment proofs
      const detailedOrder = await getOrder(order.id);
      selectedOrderDetail = detailedOrder;
      showOrderDetailModal = true;
    } catch (error) {
      console.error('Error fetching detailed order:', error);
      // Fallback to the basic order if detailed fetch fails
      selectedOrderDetail = order;
      showOrderDetailModal = true;
    }
  }

  function closeDetailModal() {
    showOrderDetailModal = false;
  }

  function handleSearch(keyword: string) {
    searchKeyword = keyword.toLowerCase();
    currentPage = 1;
  }

  function paginate(array: Order[], page: number, size: number) {
    const start = (page - 1) * size;
    return array.slice(start, start + size);
  }

  function toggleSort(key: keyof Order) {
    if (sortKey === key) {
      sortDirection = sortDirection === "asc" ? "desc" : "asc";
    } else {
      sortKey = key;
      sortDirection = "asc";
    }
  }

  $: filteredOrders = orders.filter(
    (o) =>
      o.orderNumber.toLowerCase().includes(searchKeyword) ||
      o.user.name.toLowerCase().includes(searchKeyword)
  );

  $: sortedOrders = [...filteredOrders].sort((a, b) => {
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

  $: paginatedOrders = paginate(sortedOrders, currentPage, pageSize);
</script>

<DefaultLayout title="Orders">
  <PageHeader
    title="Orders"
    icon="📦"
    showAddButton={isAdmin || isStaff}
    addLabel="Tambah"
    onAdd={openAddModal}
  />

  <TableToolbar on:search={(e: CustomEvent<string>) => handleSearch(e.detail)} />

  <OrderTable
    orders={paginatedOrders}
    onEdit={openEditModal}
    onDelete={(order) => (isAdmin || isStaff) && askDelete(order)}
    onDetail={openDetailModal}
    onSort={toggleSort}
    {sortKey}
    {sortDirection}
    {isAdmin}
    {isStaff}
  />

  <Pagination
    totalItems={filteredOrders.length}
    {currentPage}
    {pageSize}
    onPageChange={(p) => (currentPage = p)}
  />

  <OrderFormModal
    show={showOrderModal}
    {isEditMode}
    {loading}
    initial={orderForm}
    {users}
    {products}
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

  <OrderDetailModal
    show={showOrderDetailModal}
    order={selectedOrderDetail}
    onClose={closeDetailModal}
  />

  {#if isAdmin || isStaff}
    <ConfirmModal
      id={confirmModalId}
      title="Hapus Order"
      message={`Yakin ingin menghapus order ${orderToDelete?.orderNumber}?`}
      confirmText="Hapus"
      confirmClass="btn-outline btn-error"
      cancelText="Batal"
      cancelClass="btn-outline btn-warning"
      onConfirm={onConfirmDelete}
    />
  {/if}
</DefaultLayout>