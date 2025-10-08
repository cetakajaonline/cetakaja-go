<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import Modal from '$lib/components/ui/Modal.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import FormInput from '$lib/components/ui/FormInput.svelte';
  import type { User, Product, ProductVariant } from '$lib/types';

  import type { Order, OrderItem } from '$lib/types';

  let { 
    show, 
    isEditMode, 
    loading, 
    initial, 
    users, 
    products, 
    isAdmin
  }: { 
    show: boolean;
    isEditMode: boolean;
    loading: boolean;
    initial: any;
    users: User[];
    products: (Product & { variants: ProductVariant[] })[];
    isAdmin: boolean;
  } = $props();

  const dispatch = createEventDispatcher();

  let formData = $state({ ...initial });
  let orderItems = $state<OrderItem[]>([...initial.orderItems || []]);
  
  // State for managing new order items
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
      const variant = productVariants.find((v: ProductVariant) => v.id === newOrderItem.variantId);
      if (variant) {
        newOrderItem.price = variant.price;
      }
    } else if (newOrderItem.productId && productVariants.length === 0) {
      // If product has no variants, use a default price or get it from somewhere else
      // For now, we'll leave price as is or set to 0 if no variant is selected
      // The implementation might need to get the base price from the product
    }
  });

  // Update subtotal when qty or price changes
  $effect(() => {
    if (newOrderItem.qty > 0 && newOrderItem.price > 0) {
      newOrderItem.subtotal = newOrderItem.qty * newOrderItem.price;
    }
  });

  $effect(() => {
    if (show) {
      formData = { ...initial };
      orderItems = [...initial.orderItems || []];
    }
  });

  function calculateTotal() {
    return orderItems.reduce((sum, item) => sum + item.subtotal, 0);
  }

  function addOrderItem() {
    if (newOrderItem.productId === 0 || newOrderItem.qty <= 0) {
      alert("Silakan pilih produk dan masukkan jumlah yang valid");
      return;
    }

    const product = products.find(p => p.id === newOrderItem.productId);
    if (!product) {
      alert("Produk tidak ditemukan");
      return;
    }

    const item: OrderItem = {
      id: Date.now(), // temporary ID, will be replaced by server
      productId: newOrderItem.productId,
      variantId: newOrderItem.variantId || null,
      qty: newOrderItem.qty,
      price: newOrderItem.price,
      subtotal: newOrderItem.subtotal,
      product: {
        id: product.id,
        name: product.name
      },
      variant: newOrderItem.variantId ? 
        (product.variants.find(v => v.id === newOrderItem.variantId) || null) : 
        null
    };

    orderItems = [...orderItems, item];
    formData.totalAmount = calculateTotal();

    // Reset form
    newOrderItem = {
      productId: 0,
      variantId: undefined,
      qty: 1,
      price: 0,
      subtotal: 0
    };
  }

  function removeOrderItem(index: number) {
    orderItems.splice(index, 1);
    orderItems = [...orderItems]; // Trigger reactive update
    formData.totalAmount = calculateTotal();
  }

  async function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    // Update form data with order items
    const finalFormData = {
      ...formData,
      orderItems
    };
    
    dispatch('submit', finalFormData);
  }

  function handleClose() {
    dispatch('close');
  }

  // Helper function to format currency
  function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  }


</script>

<Modal {show} on:close={handleClose}>
  <form onsubmit={handleSubmit} class="p-6 w-full max-w-7xl mx-auto h-full flex flex-col">
    <h2 class="text-xl font-semibold text-center mb-4">
      {isEditMode ? 'Edit Order' : 'Tambah Order Baru'}
    </h2>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 flex-grow overflow-y-auto">
      <div class="form-control w-full">
        <label class="label" for="orderNumber">
          <span class="label-text">Nomor Order</span>
        </label>
        <input
          id="orderNumber"
          type="text"
          class="input input-bordered w-full"
          bind:value={formData.orderNumber}
          required
        />
      </div>
      
      <div class="form-control w-full">
        <label class="label" for="status">
          <span class="label-text">Status</span>
        </label>
        <select
          id="status"
          class="select select-bordered w-full"
          bind:value={formData.status}
        >
          <option value="pending">Pending</option>
          <option value="processing">Processing</option>
          <option value="finished">Finished</option>
          <option value="canceled">Canceled</option>
        </select>
      </div>
      
      <div class="form-control w-full">
        <label class="label" for="userId">
          <span class="label-text">Pelanggan</span>
        </label>
        <select
          id="userId"
          class="select select-bordered w-full"
          bind:value={formData.userId}
        >
          {#each users as user}
            <option value={user.id}>{user.name} ({user.username})</option>
          {/each}
        </select>
      </div>
      
      <div class="form-control w-full">
        <label class="label" for="shippingMethod">
          <span class="label-text">Metode Pengiriman</span>
        </label>
        <select
          id="shippingMethod"
          class="select select-bordered w-full"
          bind:value={formData.shippingMethod}
        >
          <option value="pickup">Ambil Sendiri</option>
          <option value="delivery">Dikirim</option>
        </select>
      </div>
      
      {#if formData.shippingMethod === 'delivery'}
      <div class="form-control w-full md:col-span-2">
        <label class="label" for="shippingAddress">
          <span class="label-text">Alamat Pengiriman</span>
        </label>
        <textarea
          id="shippingAddress"
          class="textarea textarea-bordered w-full"
          bind:value={formData.shippingAddress}
          rows="2"
        ></textarea>
      </div>
      {/if}
      
      <div class="form-control w-full">
        <label class="label" for="paymentMethod">
          <span class="label-text">Metode Pembayaran</span>
        </label>
        <select
          id="paymentMethod"
          class="select select-bordered w-full"
          bind:value={formData.paymentMethod}
        >
          <option value="transfer">Transfer</option>
          <option value="qris">QRIS</option>
          <option value="cash">Tunai</option>
        </select>
      </div>
      
      <div class="form-control w-full">
        <label class="label" for="paymentStatus">
          <span class="label-text">Status Pembayaran</span>
        </label>
        <select
          id="paymentStatus"
          class="select select-bordered w-full"
          bind:value={formData.paymentStatus}
        >
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="failed">Failed</option>
          <option value="refunded">Refunded</option>
        </select>
      </div>
    </div>

    <!-- Order Items Section -->
    <div class="pt-4">
      <h4 class="font-semibold text-md mb-2">Item Pesanan</h4>
      
      <!-- Add New Item -->
      <div class="p-4 border rounded-lg mb-4">
        <div class="grid grid-cols-1 md:grid-cols-5 gap-2">
          <div class="form-control w-full">
            <label class="label" for="newItemProduct">
              <span class="label-text">Produk</span>
            </label>
            <select
              id="newItemProduct"
              class="select select-bordered w-full text-sm"
              bind:value={newOrderItem.productId}
            >
              <option value="0">Pilih Produk</option>
              {#each products as product}
                <option value={product.id}>{product.name}</option>
              {/each}
            </select>
          </div>
          
          <div class="form-control w-full">
            <label class="label" for="newItemVariant">
              <span class="label-text">Varian</span>
            </label>
            <select
              id="newItemVariant"
              class="select select-bordered w-full text-sm"
              bind:value={newOrderItem.variantId}
            >
              <option value="">Pilih Varian</option>
              {#each productVariants as variant}
                <option value={variant.id}>{variant.variantName} - {formatCurrency(variant.price)}</option>
              {/each}
            </select>
          </div>
          
          <div class="form-control w-full">
            <label class="label" for="newItemQty">
              <span class="label-text">Jumlah</span>
            </label>
            <input
              id="newItemQty"
              type="number"
              min="1"
              class="input input-bordered w-full text-sm"
              bind:value={newOrderItem.qty}
            />
          </div>
          
          <div class="form-control w-full">
            <label class="label" for="newItemPrice">
              <span class="label-text">Harga</span>
            </label>
            <input
              id="newItemPrice"
              type="number"
              min="0"
              class="input input-bordered w-full text-sm"
              bind:value={newOrderItem.price}
              readonly={!newOrderItem.variantId}
            />
          </div>
          
          <div class="form-control w-full">
            <label class="label" for="newItemSubtotal">
              <span class="label-text">Subtotal</span>
            </label>
            <input
              id="newItemSubtotal"
              type="number"
              min="0"
              class="input input-bordered w-full text-sm"
              bind:value={newOrderItem.subtotal}
              readonly
            />
          </div>
          
          <div class="flex items-end">
            <button
              type="button"
              onclick={addOrderItem}
              class="btn btn-primary btn-sm w-full"
            >
              Tambah
            </button>
          </div>
        </div>
      </div>
      
      <!-- Existing Items -->
      {#if orderItems.length > 0}
      <div class="overflow-x-auto">
        <table class="table table-sm">
          <thead>
            <tr>
              <th>Produk</th>
              <th>Varian</th>
              <th>Jumlah</th>
              <th>Harga</th>
              <th>Subtotal</th>
              <th class="text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {#each orderItems as item, index}
              <tr>
                <td>{products.find(p => p.id === item.productId)?.name}</td>
                <td>{item.variant?.variantName || '-'}</td>
                <td>{item.qty}</td>
                <td>{formatCurrency(item.price)}</td>
                <td>{formatCurrency(item.subtotal)}</td>
                <td class="text-right">
                  <button
                    onclick={() => removeOrderItem(index)}
                    class="btn btn-error btn-xs"
                  >
                    Hapus
                  </button>
                </td>
              </tr>
            {/each}
            <tr class="font-bold">
              <td colspan="4" class="text-right">Total</td>
              <td>{formatCurrency(calculateTotal())}</td>
              <td></td>
            </tr>
          </tbody>
        </table>
      </div>
      {/if}
    </div>

    <div class="flex justify-center gap-4 mt-6">
      <Button type="submit" className="btn-primary" loading={loading}>
        {isEditMode ? 'Simpan Perubahan' : 'Tambah Order'}
      </Button>
      <Button type="button" className="btn-outline" onclick={handleClose}>
        Batal
      </Button>
    </div>
  </form>
</Modal>