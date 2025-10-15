<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import Modal from '$lib/components/ui/Modal.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import SearchSelect from '$lib/components/ui/SearchSelect.svelte';
  import type { User, Product, ProductVariant, ProductVariantOption, OrderItem, OrderItemOption } from '$lib/types';
  import { formatCurrency } from '$lib/utils/formatters';

  let { 
    show, 
    isEditMode, 
    loading, 
    initial, 
    users, 
    products  }: { 
    show: boolean;
    isEditMode: boolean;
    loading: boolean;
    initial: any;
    users: User[];
    products: (Product & { variants: ProductVariant[] })[];
  } = $props();

  const dispatch = createEventDispatcher();

  let formData = $state({ ...initial });
  let orderItems = $state<OrderItem[]>([...initial.orderItems || []]);
  
  // State for managing payment proof
  let paymentProofFile = $state<File | null>(null);
  let paymentProofPreview = $state<string | null>(null);
  
  // State for managing new order items
  let newOrderItem = $state({
    productId: 0,
    qty: 1,
    price: 0,
    subtotal: 0,
    notes: '',
    selectedOptions: {} as Record<number, number> // variantId -> optionId mapping
  });

  // State for product variants and options - computed based on selected product
  let productVariants = $state<ProductVariant[]>([]);

  // Update product variants when selected product changes using reactive effect
  $effect(() => {
    const product = products.find(p => p.id === newOrderItem.productId);
    productVariants = product ? (product.variants || []) : [];
    // Reset selected options when product changes
    newOrderItem.selectedOptions = {};
  });

  // Update price when options change using derived state
  $effect(() => {
    // Recalculate price based on selected options
    let totalPrice = 0;
    for (const variant of productVariants) {
      const selectedOptionId = newOrderItem.selectedOptions[variant.id];
      if (selectedOptionId) {
        const option = variant.options ? variant.options.find((opt: ProductVariantOption) => opt.id === selectedOptionId) : undefined;
        if (option) {
          totalPrice += option.price;
        }
      }
    }
    newOrderItem.price = totalPrice;
  });

  // Update subtotal when qty or price changes using derived state
  $effect(() => {
    if (newOrderItem.qty > 0 && newOrderItem.price > 0) {
      newOrderItem.subtotal = newOrderItem.qty * newOrderItem.price;
    }
  });

  // Handle modal state changes using reactive assignments
  let previousShow = $state(false);
  $effect(() => {
    if (show && !previousShow) { // Only run when modal opens (show becomes true from false)
      formData = { ...initial };
      orderItems = [...initial.orderItems || []];
      // Set default values for shipping and payment
      if (!formData.shippingMethod) formData.shippingMethod = 'delivery';
      if (!formData.paymentMethod) formData.paymentMethod = 'transfer';
      // Reset payment proof when modal opens
      paymentProofFile = null;
      paymentProofPreview = null;
      
      previousShow = show;
    } else if (!show && previousShow) { // When modal closes
      previousShow = show;
    }
  });

  // Update payment method when shipping method changes to ensure consistency
  $effect(() => {
    if (formData.shippingMethod !== 'pickup' && formData.paymentMethod === 'cash') {
      // If shipping method is not pickup but payment method is cash, change to transfer
      formData.paymentMethod = 'transfer';
    }
  });

  // Handle payment proof file selection
  function handlePaymentProofChange(e: Event) {
    const target = e.target as HTMLInputElement;
    if (target.files && target.files[0]) {
      const file = target.files[0];
      
      // Validate file type (image/pdf only)
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
      if (!validTypes.includes(file.type)) {
        alert('Hanya file gambar (JPG, PNG) atau PDF yang diperbolehkan');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Ukuran file maksimal 5MB');
        return;
      }
      
      paymentProofFile = file;
      
      // Create preview for image files
      if (file.type.startsWith('image/')) {
        paymentProofPreview = URL.createObjectURL(file);
      } else {
        paymentProofPreview = null; // PDF files don't have previews
      }
    }
  }

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
    
    // Check if product has variants and if so, all required options must be selected
    const requiredVariants = product.variants ? product.variants.filter(v => v.options && v.options.length > 0) : [];
    for (const variant of requiredVariants) {
      if (!newOrderItem.selectedOptions[variant.id]) {
        alert(`Silakan pilih opsi untuk ${variant.variantName}`);
        return;
      }
    }

    // Create order item options array
    const orderItemOptions: OrderItemOption[] = [];
    for (const [variantId, optionId] of Object.entries(newOrderItem.selectedOptions)) {
      const variantIdNum = Number(variantId);
      const optionIdNum = Number(optionId);
      
      const variant = product.variants.find((v: ProductVariant) => v.id === variantIdNum);
      const option = variant?.options.find((opt: ProductVariantOption) => opt.id === optionIdNum);
      
      if (variant && option) {
        orderItemOptions.push({
          id: Date.now() + Math.random(), // temporary ID
          orderItemId: 0, // temporary, will be set by server
          optionId: optionIdNum,
          optionName: option.optionName,
          price: option.price,
          createdAt: new Date(),
          option: {
            id: option.id,
            optionName: option.optionName,
            price: option.price,
            variant: {
              id: variant.id,
              variantName: variant.variantName,
            }
          }
        });
      }
    }

    const item: OrderItem = {
      id: Date.now(), // temporary ID, will be replaced by server
      productId: newOrderItem.productId,
      qty: newOrderItem.qty,
      price: newOrderItem.price,
      subtotal: newOrderItem.subtotal,
      notes: newOrderItem.notes || null,
      product: {
        id: product.id,
        name: product.name
      },
      options: orderItemOptions
    };

    orderItems = [...orderItems, item];
    formData.totalAmount = calculateTotal();

    // Reset form
    newOrderItem = {
      productId: 0,
      qty: 1,
      price: 0,
      subtotal: 0,
      notes: '',
      selectedOptions: {}
    };
  }

  function removeOrderItem(index: number) {
    orderItems.splice(index, 1);
    orderItems = [...orderItems]; // Trigger reactive update
    formData.totalAmount = calculateTotal();
  }

  async function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    
    // Validate payment method based on shipping method
    if (formData.paymentMethod === 'cash' && formData.shippingMethod !== 'pickup') {
      alert('Pembayaran tunai hanya dapat digunakan dengan metode pengiriman pickup (ambil sendiri)');
      return;
    }
    
    // Validate payment proof if payment method is transfer or qris
    if ((formData.paymentMethod === 'transfer' || formData.paymentMethod === 'qris') && !paymentProofFile) {
      alert('Silakan upload bukti pembayaran untuk metode transfer atau QRIS');
      return;
    }
    
    // Update form data with order items
    const finalFormData = {
      ...formData,
      orderItems,
      // Include payment proof file if it exists
      ...(paymentProofFile && { paymentProofFile })
    };
    
    dispatch('submit', finalFormData);
    
    // Reset payment proof state after submission
    paymentProofFile = null;
    paymentProofPreview = null;
  }

  function handleClose() {
    // Clean up object URL to prevent memory leak
    if (paymentProofPreview) {
      URL.revokeObjectURL(paymentProofPreview);
    }
    // Reset payment proof state
    paymentProofFile = null;
    paymentProofPreview = null;
    dispatch('close');
  }

  // Helper function to format currency

  // Prepare options for SearchSelect
  let customerOptions = $derived(
    users
      .filter(user => user.role === 'customer')
      .map(user => ({
        value: user.id,
        label: `${user.name} - ${user.phone}`
      }))
  );

  let productOptions = $derived(
    products.map(product => ({
      value: product.id,
      label: product.name
    }))
  );

  // Payment options that depend on shipping method
  let paymentOptions = $derived(
    formData.shippingMethod === 'pickup'
      ? [
          { value: 'transfer', label: 'Transfer' },
          { value: 'qris', label: 'QRIS' },
          { value: 'cash', label: 'Tunai' }
        ]
      : [
          { value: 'transfer', label: 'Transfer' },
          { value: 'qris', label: 'QRIS' }
        ]
  );

</script>

<Modal {show} size="xl" on:close={handleClose}>
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
        <SearchSelect
          id="userId"
          bind:value={formData.userId}
          options={customerOptions}
          placeholder="Cari pelanggan..."
          autocomplete="off"
        />
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
          <option value="pickup">Pickup</option>
          <option value="delivery">Delivery</option>
        </select>
      </div>
      
      <div class="form-control w-full">
        <label class="label" for="paymentMethod">
          <span class="label-text">Metode Pembayaran</span>
        </label>
        <select
          id="paymentMethod"
          class="select select-bordered w-full"
          bind:value={formData.paymentMethod}
        >
          {#each paymentOptions as option}
            <option value={option.value}>{option.label}</option>
          {/each}
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
      <!-- Add New Item -->
      <div class="p-4 border rounded-lg mb-4">
        <div class="grid grid-cols-1 md:grid-cols-6 gap-2">
          <div class="form-control w-full">
            <label class="label" for="newItemProduct">
              <span class="label-text">Produk</span>
            </label>
            <SearchSelect
              id="newItemProduct"
              bind:value={newOrderItem.productId}
              options={productOptions}
              placeholder="Cari produk..."
              autocomplete="off"
            />
          </div>
          
          <!-- Dynamic option selectors based on product variants -->
          {#if productVariants.length > 0}
            {#each productVariants as variant, i}
              <div class="form-control w-full">
                <label class="label" for={"newItemOption-" + variant.id}>
                  <span class="label-text">{variant.variantName}</span>
                </label>
                <select
                  id={"newItemOption-" + variant.id}
                  class="select select-bordered w-full text-sm"
                  bind:value={newOrderItem.selectedOptions[variant.id]}
                >
                  <option value="">Pilih {variant.variantName}</option>
                  {#each variant.options || [] as option}
                    <option value={option.id}>{option.optionName} - {formatCurrency(option.price)}</option>
                  {/each}
                </select>
              </div>
            {/each}
          {/if}
          
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
              readonly
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
          
          <div class="form-control w-full">
            <label class="label" for="newItemNotes">
              <span class="label-text">Link Desain</span>
            </label>
            <input
              id="newItemNotes"
              type="text"
              class="input input-bordered w-full text-sm"
              bind:value={newOrderItem.notes}
              placeholder="Google Drive, dll"
            />
          </div>
          
          <div class="flex items-end">
            <button
              type="button"
              onclick={addOrderItem}
              class="btn btn-primary btn-sm w-full"
              disabled={!newOrderItem.productId || newOrderItem.qty <= 0}
            >
              Tambah
            </button>
          </div>
        </div>
      </div>
      
      <!-- Existing Items -->
      {#if orderItems.length > 0}
      <!-- Mobile Card Layout -->
      <div class="block sm:hidden">
        {#each orderItems as item, index}
          <div class="border-b border-gray-200 p-4 mb-4 rounded-lg bg-base-100">
            <div class="flex justify-between items-start mb-2">
              <div class="font-bold">{products.find(p => p.id === item.productId)?.name}</div>
              <button
                onclick={() => removeOrderItem(index)}
                class="btn btn-error btn-xs"
              >
                Hapus
              </button>
            </div>
            
            <div class="space-y-2">
              {#if item.options && item.options.length > 0}
                <div class="flex flex-col">
                  <div class="w-2/5 font-semibold">Opsi:</div>
                  <div class="w-3/5 text-right">
                    {#each item.options as option}
                      <div>{option.option?.variant?.variantName}: {option.optionName}</div>
                    {/each}
                  </div>
                </div>
              {:else}
                <div class="flex">
                  <div class="w-2/5 font-semibold">Opsi:</div>
                  <div class="w-3/5 text-right">-</div>
                </div>
              {/if}
              
              <div class="flex">
                <div class="w-2/5 font-semibold">Jumlah:</div>
                <div class="w-3/5 text-right">{item.qty}</div>
              </div>
              
              <div class="flex">
                <div class="w-2/5 font-semibold">Harga:</div>
                <div class="w-3/5 text-right">{formatCurrency(item.price)}</div>
              </div>
              
              <div class="flex">
                <div class="w-2/5 font-semibold">Subtotal:</div>
                <div class="w-3/5 text-right font-bold">{formatCurrency(item.subtotal)}</div>
              </div>
              
              <div class="flex">
                <div class="w-2/5 font-semibold">Link Desain:</div>
                <div class="w-3/5 text-right">
                  {#if item.notes}
                    <a href="{item.notes}" target="_blank" class="text-blue-600 hover:underline break-all">
                      Lihat Desain
                    </a>
                  {:else}
                    <span>-</span>
                  {/if}
                </div>
              </div>
            </div>
          </div>
        {/each}
        
        <div class="flex justify-between p-4 rounded-lg bg-base-100 font-bold">
          <div class="text-right">Total:</div>
          <div>{formatCurrency(calculateTotal())}</div>
        </div>
      </div>
      
      <!-- Desktop Table Layout -->
      <div class="hidden sm:block overflow-x-auto">
        <table class="table table-sm">
          <thead>
            <tr>
              <th>Produk</th>
              <th>Varian</th>
              <th>Jumlah</th>
              <th>Harga</th>
              <th>Subtotal</th>
              <th>Link Desain</th>
              <th class="text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {#each orderItems as item, index}
              <tr>
                <td>{products.find(p => p.id === item.productId)?.name}</td>
                {#if item.options && item.options.length > 0}
                  <td>
                    {#each item.options as option}
                      <div>{option.option?.variant?.variantName}: {option.optionName}</div>
                    {/each}
                  </td>
                {:else}
                  <td>-</td>
                {/if}
                <td>{item.qty}</td>
                <td>{formatCurrency(item.price)}</td>
                <td>{formatCurrency(item.subtotal)}</td>
                <td>
                  {#if item.notes}
                    <a href="{item.notes}" target="_blank" class="text-blue-600 hover:underline break-all">
                      Lihat Desain
                    </a>
                  {:else}
                    -
                  {/if}
                </td>
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
              <td colspan="5" class="text-right">Total</td>
              <td>{formatCurrency(calculateTotal())}</td>
              <td></td>
            </tr>
          </tbody>
        </table>
      </div>
      {/if}
    </div>

    <!-- Payment Proof Section (only for transfer and qris) -->
    {#if formData.paymentMethod === 'transfer' || formData.paymentMethod === 'qris'}
    <div class="pt-4">
      <div class="form-control w-full md:col-span-2">
        <label class="label" for="paymentProof">
          <span class="label-text">Bukti Pembayaran</span>
        </label>
        <input
          id="paymentProof"
          type="file"
          class="file-input file-input-bordered w-full"
          accept="image/jpeg,image/jpg,image/png,application/pdf"
          onchange={handlePaymentProofChange}
        />
        
        {#if paymentProofPreview}
          <div class="mt-2">
            <div class="flex items-center justify-between">
              <div class="flex-1">
                {#if paymentProofFile?.type.startsWith('image/')}
                  <img 
                    src={paymentProofPreview} 
                    alt="Preview Bukti Pembayaran" 
                    class="w-full max-w-full h-auto max-h-64 object-contain rounded-lg"
                  />
                {:else}
                  <div class="p-4 bg-gray-100 rounded border flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-2 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span>File PDF: {paymentProofFile?.name}</span>
                  </div>
                {/if}
              </div>
              <button 
                type="button" 
                class="btn btn-sm btn-ghost ml-2"
                onclick={() => {
                  if (paymentProofPreview) URL.revokeObjectURL(paymentProofPreview);
                  paymentProofFile = null;
                  paymentProofPreview = null;
                }}
              >
                Hapus
              </button>
            </div>
          </div>
        {/if}
      </div>
    </div>
    {/if}

    <!-- Notes Section -->
    <div class="pt-4">
      <div class="form-control w-full md:col-span-2">
        <label class="label" for="notes">
          <span class="label-text">Catatan</span>
        </label>
        <textarea
          id="notes"
          class="textarea textarea-bordered w-full"
          bind:value={formData.notes}
          placeholder="Catatan tambahan untuk pesanan"
          rows="2"
        ></textarea>
      </div>
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




