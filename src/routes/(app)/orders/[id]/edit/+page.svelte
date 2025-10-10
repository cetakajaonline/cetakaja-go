<script lang="ts">
  import { onMount } from "svelte";
  import type { PageData } from "./$types";
  import { browser } from "$app/environment";
  import { goto } from "$app/navigation";
  import { updateOrder } from "$lib/services/orderClient";
  import SearchSelect from "$lib/components/ui/SearchSelect.svelte";
  import type { User, Product, ProductVariant } from "$lib/types";

  let { data }: { data: PageData } = $props();

  let { order, users, products } = data;
  
  let formData = $state({
    userId: order.user.id,
    orderNumber: order.orderNumber,
    status: order.status as "pending" | "processing" | "finished" | "canceled",
    shippingMethod: "delivery" as "pickup" | "delivery", // Changed to delivery by default

    paymentMethod: order.paymentMethod as "transfer" | "qris" | "cash",
    paymentStatus: order.paymentStatus as "pending" | "confirmed" | "failed" | "refunded",
    totalAmount: order.totalAmount,
    orderItems: order.orderItems.map(item => ({
      id: item.id,
      productId: item.product.id,
      variantId: item.variant?.id,
      qty: item.qty,
      price: item.price,
      subtotal: item.subtotal,
    }))
  });

  // Type definition for form order items that allows temporary IDs
  type FormOrderItem = {
    id: number;
    productId: number;
    variantId: number | undefined;
    qty: number;
    price: number;
    subtotal: number;
  };

  let loading = $state(false);
  let error = $state<string | null>(null);

  // State for managing order items
  let newOrderItem = $state({
    productId: 0,
    variantId: undefined as number | undefined,
    qty: 1,
    price: 0,
    subtotal: 0
  });

  // State for product variants - computed based on selected product
  let productVariants = $state<ProductVariant[]>([]);

  // Update product variants when selected product changes
  $effect(() => {
    const product = products.find(p => p.id === newOrderItem.productId);
    productVariants = product ? (product.variants || []) : [];
  });

  // Update price when variant changes
  $effect(() => {
    if (newOrderItem.variantId) {
      const variant = productVariants.find(v => v.id === newOrderItem.variantId);
      if (variant) {
        newOrderItem.price = variant.price;
      }
    }
  });

  // Update subtotal when qty or price changes
  $effect(() => {
    if (newOrderItem.qty > 0 && newOrderItem.price > 0) {
      newOrderItem.subtotal = newOrderItem.qty * newOrderItem.price;
    }
  });

  function calculateTotal() {
    return formData.orderItems.reduce((sum, item) => sum + item.subtotal, 0);
  }

  function addOrderItem() {
    if (newOrderItem.productId === 0 || newOrderItem.qty <= 0) {
      error = "Silakan pilih produk dan masukkan jumlah yang valid";
      return;
    }

    // Check if variant is required and selected
    if (newOrderItem.productId && productVariants.length > 0 && !newOrderItem.variantId) {
      error = "Silakan pilih varian produk";
      return;
    }

    // Find the selected product to get its details
    const product = products.find(p => p.id === newOrderItem.productId);
    if (!product) {
      error = "Produk tidak ditemukan";
      return;
    }

    // For now, set price to 0, but in a real implementation you would get the correct price
    // This would require the variant to be selected and have price information
    // Create a temporary ID for the new item using timestamp
    const tempId = -(Date.now()); // Negative to avoid conflicts with real IDs
    const item: FormOrderItem = {
      id: tempId, // Temporary ID that will be replaced by the backend
      productId: newOrderItem.productId,
      variantId: newOrderItem.variantId,
      qty: newOrderItem.qty,
      price: newOrderItem.price,
      subtotal: newOrderItem.qty * newOrderItem.price
    };

    formData.orderItems = [...formData.orderItems, item] as FormOrderItem[];
    formData.totalAmount = calculateTotal();

    // Reset form
    newOrderItem = {
      productId: 0,
      variantId: undefined,
      qty: 1,
      price: 0,
      subtotal: 0
    };
    error = null;
  }

  function removeOrderItem(index: number) {
    formData.orderItems.splice(index, 1);
    formData.totalAmount = calculateTotal();
  }

  async function handleSubmit(e: Event) {
    e.preventDefault();
    loading = true;
    error = null;
    
    try {
      await updateOrder(order.id, {
        ...formData,
        totalAmount: calculateTotal(),
      });
      
      // Redirect to order detail page
      goto(`/orders/${order.id}`);
    } catch (err) {
      console.error("Error updating order:", err);
      error = (err as Error).message || "Gagal mengupdate order";
    } finally {
      loading = false;
    }
  }

  function handleGoBack() {
    goto(`/orders/${order.id}`);
  }

  // Prepare options for SearchSelect
  let customerOptions = $derived(
    users
      .filter(user => user.role === 'customer')
      .map(user => ({
        value: user.id,
        label: `${user.name} (${user.username})`
      }))
  );

  let productOptions = $derived(
    products.map(product => ({
      value: product.id,
      label: product.name
    }))
  );
</script>

<div class="p-6">
  <div class="mb-6">
    <h1 class="text-2xl font-bold text-gray-800">Edit Order</h1>
    <p class="text-gray-600">#{order.orderNumber}</p>
  </div>

  <form onsubmit={handleSubmit} class="space-y-6">
    {#if error}
      <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    {/if}

    <!-- Order Information -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div class="bg-white p-6 rounded-lg shadow">
        <h2 class="text-lg font-semibold mb-4">Informasi Order</h2>
        
        <div class="space-y-4">
          <div>
            <label for="orderNumber" class="block text-sm font-medium text-gray-700 mb-1">Nomor Order</label>
            <input
              id="orderNumber"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              bind:value={formData.orderNumber}
              readonly
            />
          </div>
          
          <div>
            <label for="status" class="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              id="status"
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              bind:value={formData.status}
            >
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="finished">Finished</option>
              <option value="canceled">Canceled</option>
            </select>
          </div>
          
          <div>
            <label for="userId" class="block text-sm font-medium text-gray-700 mb-1">Pelanggan</label>
            <SearchSelect
              id="userId"
              bind:value={formData.userId}
              options={customerOptions}
              placeholder="Cari pelanggan..."
            />
          </div>
          
          <!-- Shipping method and address are now handled differently - hidden fields -->
          <input type="hidden" bind:value={formData.shippingMethod} />

        </div>
      </div>

      <div class="bg-white p-6 rounded-lg shadow">
        <h2 class="text-lg font-semibold mb-4">Pembayaran</h2>
        
        <div class="space-y-4">
          <div>
            <label for="paymentMethod" class="block text-sm font-medium text-gray-700 mb-1">Metode Pembayaran</label>
            <select
              id="paymentMethod"
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              bind:value={formData.paymentMethod}
            >
              <option value="transfer">Transfer</option>
              <option value="qris">QRIS</option>
              <option value="cash">Tunai</option>
            </select>
          </div>
          
          <div>
            <label for="paymentStatus" class="block text-sm font-medium text-gray-700 mb-1">Status Pembayaran</label>
            <select
              id="paymentStatus"
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              bind:value={formData.paymentStatus}
            >
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>
          
          <div>
            <label for="totalAmount" class="block text-sm font-medium text-gray-700 mb-1">Total</label>
            <input
              id="totalAmount"
              type="number"
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              bind:value={formData.totalAmount}
              readonly
            />
            <p class="text-sm text-gray-500 mt-1">Total dihitung otomatis dari item pesanan</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Order Items -->
    <div class="bg-white p-6 rounded-lg shadow">
      <h2 class="text-lg font-semibold mb-4">Item Pesanan</h2>
      
      <!-- Add New Item -->
      <div class="mb-6 p-4 border border-gray-200 rounded-lg">
        <h3 class="font-medium text-gray-700 mb-3">Tambah Item Baru</h3>
        <div class="grid grid-cols-1 md:grid-cols-5 gap-3">
          <div>
            <label for="newOrderItemProduct" class="block text-sm font-medium text-gray-700 mb-1">Produk</label>
            <SearchSelect
              id="newOrderItemProduct"
              bind:value={newOrderItem.productId}
              options={productOptions}
              placeholder="Cari produk..."
            />
          </div>
          
          <div>
            <label for="newOrderItemVariant" class="block text-sm font-medium text-gray-700 mb-1">Varian</label>
            <select
              id="newOrderItemVariant"
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              bind:value={newOrderItem.variantId}
            >
              <option value="">Pilih Varian</option>
              {#each productVariants as variant}
                <option value={variant.id}>{variant.variantName} - {new Intl.NumberFormat('id-ID', {
                  style: 'currency',
                  currency: 'IDR',
                  minimumFractionDigits: 0
                }).format(variant.price)}</option>
              {/each}
            </select>
          </div>
          
          <div>
            <label for="newOrderItemQty" class="block text-sm font-medium text-gray-700 mb-1">Jumlah</label>
            <input
              id="newOrderItemQty"
              type="number"
              min="1"
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              bind:value={newOrderItem.qty}
            />
          </div>
          
          <div>
            <label for="newOrderItemPrice" class="block text-sm font-medium text-gray-700 mb-1">Harga</label>
            <input
              id="newOrderItemPrice"
              type="number"
              min="0"
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              bind:value={newOrderItem.price}
              readonly={!newOrderItem.variantId}
            />
          </div>
          
          <div class="flex items-end">
            <button
              type="button"
              onclick={addOrderItem}
              class="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Tambah
            </button>
          </div>
        </div>
        
        {#if error && newOrderItem.productId === 0}
          <p class="mt-2 text-sm text-red-600">{error}</p>
        {/if}
      </div>
      
      <!-- Existing Items -->
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Produk</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Varian</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jumlah</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Harga</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subtotal</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            {#each formData.orderItems as item, index}
              <tr>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900">
                    {products.find(p => p.id === item.productId)?.name}
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900">
                    {#if item.variantId}
                      {#if products.find(p => p.id === item.productId)}
                        {#each products.find(p => p.id === item.productId)?.variants as variant}
                          {#if variant.id === item.variantId}
                            {variant.variantName}
                          {/if}
                        {/each}
                      {/if}
                    {:else}
                      -
                    {/if}
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900">{item.qty}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {new Intl.NumberFormat('id-ID', {
                    style: 'currency',
                    currency: 'IDR',
                    minimumFractionDigits: 0
                  }).format(item.price)}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {new Intl.NumberFormat('id-ID', {
                    style: 'currency',
                    currency: 'IDR',
                    minimumFractionDigits: 0
                  }).format(item.subtotal)}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onclick={() => removeOrderItem(index)}
                    class="text-red-600 hover:text-red-900"
                  >
                    Hapus
                  </button>
                </td>
              </tr>
            {/each}
            <tr class="bg-gray-50">
              <td colspan="4" class="px-6 py-3 text-right text-sm font-medium text-gray-900">Total</td>
              <td class="px-6 py-3 text-sm font-medium text-gray-900">
                {new Intl.NumberFormat('id-ID', {
                  style: 'currency',
                  currency: 'IDR',
                  minimumFractionDigits: 0
                }).format(calculateTotal())}
              </td>
              <td></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="flex justify-end space-x-4">
      <button
        type="button"
        onclick={handleGoBack}
        class="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
      >
        Batal
      </button>
      <button
        type="submit"
        class="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
        disabled={loading}
      >
        {loading ? "Menyimpan..." : "Simpan Perubahan"}
      </button>
    </div>
  </form>
</div>