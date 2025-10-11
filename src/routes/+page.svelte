<script lang="ts">
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  import { goto } from '$app/navigation';
  import { loginUser, registerUser } from '$lib/services/userClient';
  import { getAllProducts } from '$lib/services/productClient';
  import { createOrder } from '$lib/services/orderClient';
  import { getSettings } from '$lib/services/settingClient';
  import SearchSelect from '$lib/components/ui/SearchSelect.svelte';
  import type { User, Product, ProductVariant, OrderItem } from '$lib/types';
  import type { ApiResponse } from '$lib/types';

  // State management
  let loading = $state(false);
  let phone = $state('');
  let isExistingCustomer = $state(false);
  let customerPassword = $state('');
  let errorMessage = $state('');
  let successMessage = $state('');
  
  // Customer info after login/register
  let customer = $state<User | null>(null);
  
  // Products and order data
  let products = $state<Product[]>([]);
  let settings = $state<any>(null);
  
  let orderData = $state({
    shippingMethod: 'delivery' as 'pickup' | 'delivery',
    paymentMethod: 'transfer' as 'transfer' | 'qris' | 'cash',
    notes: '',
    orderItems: [] as OrderItem[]
  });
  
  // New item form
  let newItem = $state({
    productId: 0,
    variantId: undefined as number | undefined,
    qty: 1,
    price: 0,
    subtotal: 0
  });
  
  // Product variants for selected product
  let productVariants = $state<ProductVariant[]>([]);

  // Initialize on mount
  onMount(async () => {
    if (browser) {
      try {
        const [productsResponse, settingsResponse] = await Promise.all([
          getAllProducts(),
          getSettings()
        ]);
        
        products = productsResponse || [];
        
        if (settingsResponse.success) {
          settings = settingsResponse.data;
        }
      } catch (error) {
        console.error('Error loading data:', error);
        errorMessage = 'Gagal memuat data produk';
      }
    }
  });

  // Validate phone number
  function validatePhone(phone: string): boolean {
    return /^08\d+$/.test(phone) && phone.length >= 10 && phone.length <= 15;
  }

  // Handle phone submission
  async function handlePhoneSubmit() {
    if (!validatePhone(phone)) {
      errorMessage = 'Nomor telepon harus diawali dengan 08 dan hanya berisi angka';
      return;
    }

    loading = true;
    errorMessage = '';
    
    try {
      // Check if customer exists
      // Try to login first to see if customer exists
      const loginResponse = await loginUser({ username: phone, password: phone });
      
      if (loginResponse.success) {
        // Customer exists
        isExistingCustomer = true;
        customerPassword = phone; // Default password is phone number
        customer = loginResponse.data?.user || null;
        successMessage = 'Akun ditemukan. Silakan lanjutkan proses pemesanan.';
      } else {
        // Customer doesn't exist, register new customer
        const registerResponse = await registerUser({
          name: `Customer ${phone}`,
          username: phone,
          phone: phone,
          password: phone,
          address: null,
          role: 'customer'
        });
        
        if (registerResponse.success) {
          const loginAfterRegister = await loginUser({ 
            username: phone, 
            password: phone 
          });
          
          if (loginAfterRegister.success) {
            isExistingCustomer = true;
            customerPassword = phone;
            customer = loginAfterRegister.data?.user || null;
            successMessage = 'Akun berhasil dibuat. Silakan lanjutkan proses pemesanan.';
          } else {
            throw new Error('Gagal login setelah registrasi');
          }
        } else {
          throw new Error(registerResponse.message || 'Gagal mendaftar akun');
        }
      }
    } catch (error: any) {
      console.error('Error handling phone:', error);
      errorMessage = error.message || 'Terjadi kesalahan saat memproses nomor telepon';
    } finally {
      loading = false;
    }
  }

  // Update product variants when selected product changes
  $effect(() => {
    if (newItem.productId) {
      const product = products.find(p => p.id === newItem.productId);
      if (product) {
        productVariants = product.variants || [];
      } else {
        productVariants = [];
      }
    } else {
      productVariants = [];
    }
  });

  // Update price when variant changes
  $effect(() => {
    if (newItem.variantId) {
      const variant = productVariants.find(v => v.id === newItem.variantId);
      if (variant) {
        newItem.price = variant.price;
        newItem.subtotal = newItem.qty * variant.price;
      }
    } else if (newItem.productId) {
      // If no variant, use base product price if applicable
      // For now, we assume variants handle all pricing
      newItem.price = 0;
      newItem.subtotal = newItem.qty * newItem.price;
    }
  });

  // Update subtotal when qty changes
  $effect(() => {
    if (newItem.qty > 0 && newItem.price > 0) {
      newItem.subtotal = newItem.qty * newItem.price;
    } else {
      newItem.subtotal = 0;
    }
  });

  // Add item to order
  function addItem() {
    if (newItem.productId === 0) {
      errorMessage = 'Silakan pilih produk terlebih dahulu';
      return;
    }

    if (newItem.qty <= 0) {
      errorMessage = 'Jumlah harus lebih dari 0';
      return;
    }

    // Validate if variant is required
    const product = products.find(p => p.id === newItem.productId);
    if (product && product.variants.length > 0 && !newItem.variantId) {
      errorMessage = 'Silakan pilih varian produk terlebih dahulu';
      return;
    }

    // Create order item
    const orderItem: OrderItem = {
      id: Date.now(), // temporary ID
      productId: newItem.productId,
      variantId: newItem.variantId || null,
      qty: newItem.qty,
      price: newItem.price,
      subtotal: newItem.subtotal,
      product: {
        id: product!.id,
        name: product!.name
      },
      variant: newItem.variantId 
        ? product!.variants.find(v => v.id === newItem.variantId) || null
        : null
    };

    orderData.orderItems = [...orderData.orderItems, orderItem];

    // Reset form
    newItem = {
      productId: 0,
      variantId: undefined,
      qty: 1,
      price: 0,
      subtotal: 0
    };

    errorMessage = '';
  }

  // Remove item from order
  function removeItem(index: number) {
    orderData.orderItems.splice(index, 1);
    orderData.orderItems = [...orderData.orderItems]; // Trigger reactive update
  }

  // Calculate total
  function calculateTotal(): number {
    return orderData.orderItems.reduce((sum, item) => sum + item.subtotal, 0);
  }

  // Handle order submission
  async function handleSubmitOrder() {
    if (!customer) {
      errorMessage = 'Silakan masukkan nomor telepon terlebih dahulu';
      return;
    }

    if (orderData.orderItems.length === 0) {
      errorMessage = 'Silakan tambahkan setidaknya satu item ke pesanan';
      return;
    }

    loading = true;
    errorMessage = '';

    try {
      // Create order with adjusted orderItems format (convert variantId from null to undefined)
      const orderItemsForApi = orderData.orderItems.map(item => ({
        ...item,
        variantId: item.variantId || undefined // Convert null to undefined
      }));

      const order = await createOrder({
        userId: customer.id,
        status: 'pending',
        shippingMethod: orderData.shippingMethod,
        paymentMethod: orderData.paymentMethod,
        paymentStatus: 'pending',
        notes: orderData.notes,
        orderItems: orderItemsForApi,
        totalAmount: calculateTotal()
      });

      if (order) {
        // Redirect based on payment method
        if (orderData.paymentMethod === 'cash') {
          await goto(`/payment/cash/${order.id}`);
        } else if (orderData.paymentMethod === 'qris') {
          await goto(`/payment/qris/${order.id}`);
        } else { // transfer
          await goto(`/payment/transfer/${order.id}`);
        }
      } else {
        throw new Error('Gagal membuat pesanan');
      }
    } catch (error: any) {
      console.error('Error creating order:', error);
      errorMessage = error.message || 'Terjadi kesalahan saat membuat pesanan';
    } finally {
      loading = false;
    }
  }

  // Prepare options for SearchSelect
  let productOptions = $derived(
    products.map(product => ({
      value: product.id,
      label: product.name
    }))
  );

  // Payment options that depend on shipping method
  let paymentOptions = $derived(
    orderData.shippingMethod === 'pickup'
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

  // Helper function to format currency
  function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  }
</script>

<div class="container mx-auto px-4 py-8">
  <h1 class="text-2xl md:text-3xl font-bold text-center mb-8">Pesan Sekarang</h1>

  {#if !isExistingCustomer}
    <!-- Phone Number Input for New Customers -->
    <div class="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md">
      <h2 class="text-xl font-semibold mb-4">Masukkan Nomor Telepon</h2>
      <p class="text-gray-600 mb-4">Nomor telepon akan digunakan untuk membuat akun otomatis atau login jika sudah terdaftar</p>
      
      <div class="form-control w-full">
        <label for="phone-input" class="label">
          <span class="label-text">Nomor Telepon <span class="text-red-500">*</span></span>
        </label>
        <input
          id="phone-input"
          type="tel"
          class="input input-bordered w-full"
          placeholder="081234567890"
          bind:value={phone}
          disabled={loading}
        />
        <label for="phone-input" class="label">
          <span class="label-text-alt">Diawali dengan 08 dan hanya angka</span>
        </label>
      </div>
      
      {#if errorMessage}
        <div class="alert alert-error mt-4">
          <div>
            <span>{errorMessage}</span>
          </div>
        </div>
      {/if}
      
      {#if successMessage}
        <div class="alert alert-success mt-4">
          <div>
            <span>{successMessage}</span>
          </div>
        </div>
      {/if}
      
      <button 
        class="btn btn-primary w-full mt-4" 
        onclick={handlePhoneSubmit}
        disabled={loading}
      >
        {loading ? 'Memproses...' : 'Lanjutkan'}
      </button>
    </div>
  {:else}
    <!-- Order Form for Existing Customers -->
    <div class="bg-white p-6 rounded-lg shadow-md">
      <div class="mb-6">
        <h2 class="text-xl font-semibold">Detail Pelanggan</h2>
        <div class="mt-2 p-4 bg-gray-50 rounded">
          <p><span class="font-medium">Nama:</span> {customer?.name}</p>
          <p><span class="font-medium">Telepon:</span> {customer?.phone}</p>
          <p><span class="font-medium">Alamat:</span> {customer?.address || 'Belum diatur'}</p>
        </div>
      </div>

      <!-- Add Items to Order -->
      <div class="mb-8">
        <h2 class="text-xl font-semibold mb-4">Tambah Produk ke Pesanan</h2>
        <div class="grid grid-cols-1 md:grid-cols-5 gap-2">
          <div class="form-control w-full">
            <label for="newItemProduct" class="label">
              <span class="label-text">Produk</span>
            </label>
            <SearchSelect
              id="newItemProduct"
              bind:value={newItem.productId}
              options={productOptions}
              placeholder="Cari produk..."
              autocomplete="off"
            />
          </div>
          
          <div class="form-control w-full">
            <label for="newItemVariant" class="label">
              <span class="label-text">Varian</span>
            </label>
            <select
              id="newItemVariant"
              class="select select-bordered w-full"
              bind:value={newItem.variantId}
              disabled={!newItem.productId || productVariants.length === 0}
            >
              {#if productVariants.length > 0}
                <option value="">Pilih Varian</option>
                {#each productVariants as variant}
                  <option value={variant.id}>{variant.variantName} - {formatCurrency(variant.price)}</option>
                {/each}
              {:else}
                <option value="">-- Pilih Produk Dulu --</option>
              {/if}
            </select>
          </div>
          
          <div class="form-control w-full">
            <label for="newItemQty" class="label">
              <span class="label-text">Jumlah</span>
            </label>
            <input
              id="newItemQty"
              type="number"
              min="1"
              class="input input-bordered w-full"
              bind:value={newItem.qty}
            />
          </div>
          
          <div class="form-control w-full">
            <label for="newItemPrice" class="label">
              <span class="label-text">Harga</span>
            </label>
            <input
              id="newItemPrice"
              type="number"
              min="0"
              class="input input-bordered w-full"
              bind:value={newItem.price}
              readonly
            />
          </div>
          
          <div class="form-control w-full flex items-end">
            <button
              class="btn btn-primary w-full"
              onclick={addItem}
              disabled={!newItem.productId || newItem.qty <= 0 || (productVariants.length > 0 && !newItem.variantId)}
            >
              Tambah
            </button>
          </div>
        </div>
      </div>

      <!-- Order Items Table -->
      {#if orderData.orderItems.length > 0}
        <div class="mb-8 overflow-x-auto">
          <table class="table table-zebra">
            <thead>
              <tr>
                <th>Produk</th>
                <th>Varian</th>
                <th>Jumlah</th>
                <th>Harga</th>
                <th>Subtotal</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {#each orderData.orderItems as item, index}
                <tr>
                  <td>{item.product.name}</td>
                  <td>{item.variant?.variantName || '-'}</td>
                  <td>{item.qty}</td>
                  <td>{formatCurrency(item.price)}</td>
                  <td>{formatCurrency(item.subtotal)}</td>
                  <td>
                    <button 
                      class="btn btn-error btn-sm" 
                      onclick={() => removeItem(index)}
                    >
                      Hapus
                    </button>
                  </td>
                </tr>
              {/each}
              <tr class="font-bold">
                <td colspan="4" class="text-right">Total:</td>
                <td>{formatCurrency(calculateTotal())}</td>
                <td></td>
              </tr>
            </tbody>
          </table>
        </div>
      {/if}

      <!-- Order Details -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div class="form-control w-full">
          <label for="shippingMethod" class="label">
            <span class="label-text">Metode Pengiriman</span>
          </label>
          <select 
            id="shippingMethod"
            class="select select-bordered w-full" 
            bind:value={orderData.shippingMethod}
          >
            <option value="pickup">Pickup (Ambil Sendiri)</option>
            <option value="delivery">Delivery (Dikirim)</option>
          </select>
        </div>
        
        <div class="form-control w-full">
          <label for="paymentMethod" class="label">
            <span class="label-text">Metode Pembayaran</span>
          </label>
          <select 
            id="paymentMethod"
            class="select select-bordered w-full" 
            bind:value={orderData.paymentMethod}
          >
            {#each paymentOptions as option}
              <option value={option.value}>{option.label}</option>
            {/each}
          </select>
        </div>
        
        <div class="form-control w-full md:col-span-2">
          <label for="orderNotes" class="label">
            <span class="label-text">Catatan</span>
          </label>
          <textarea
            id="orderNotes"
            class="textarea textarea-bordered w-full"
            bind:value={orderData.notes}
            placeholder="Catatan tambahan untuk pesanan"
            rows="3"
          ></textarea>
        </div>
      </div>

      {#if errorMessage}
        <div class="alert alert-error mb-4">
          <div>
            <span>{errorMessage}</span>
          </div>
        </div>
      {/if}

      <div class="flex justify-end">
        <button 
          class="btn btn-primary" 
          onclick={handleSubmitOrder}
          disabled={loading || orderData.orderItems.length === 0}
        >
          {loading ? 'Memproses...' : 'Pesan Sekarang'}
        </button>
      </div>
    </div>
  {/if}
</div>