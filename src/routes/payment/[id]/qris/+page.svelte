<script lang="ts">
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  import { goto } from '$app/navigation';
  import { getOrder } from '$lib/services/orderClient';
  import { getSettings } from '$lib/services/settingClient';
  import type { Order } from '$lib/types';
  import type { ApiResponse } from '$lib/types';

  let { params } = $props();
  let orderId = $state<number | null>(null);
  let order = $state<Order | null>(null);
  let settings = $state<any>(null);
  let loading = $state(true);
  let errorMessage = $state('');

  onMount(async () => {
    if (browser) {
      try {
        orderId = parseInt(params.id);
        if (isNaN(orderId)) {
          errorMessage = 'ID pesanan tidak valid';
          loading = false;
          return;
        }

        // Fetch order and settings
        const [orderResult, settingsResult] = await Promise.all([
          getOrder(orderId),
          getSettings()
        ]);

        order = orderResult;
        if (settingsResult.success && settingsResult.data) {
          settings = settingsResult.data;
        } else {
          throw new Error(settingsResult.message || 'Gagal memuat pengaturan');
        }
      } catch (error: any) {
        console.error('Error loading payment page:', error);
        errorMessage = error.message || 'Terjadi kesalahan saat memuat halaman pembayaran';
      } finally {
        loading = false;
      }
    }
  });

  // Helper function to format currency
  function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  }

  async function handleBackToHome() {
    await goto('/');
  }
</script>

<div class="container mx-auto px-4 py-8">
  <h1 class="text-2xl md:text-3xl font-bold text-center mb-8">Pembayaran QRIS</h1>

  {#if loading}
    <div class="flex justify-center">
      <span class="loading loading-spinner loading-lg"></span>
    </div>
  {:else if errorMessage}
    <div class="alert alert-error">
      <div>
        <span>{errorMessage}</span>
      </div>
    </div>
  {:else if order && settings}
    <div class="bg-white p-6 rounded-lg shadow-md max-w-2xl mx-auto">
      <div class="mb-6">
        <h2 class="text-xl font-semibold mb-4">Rincian Pesanan</h2>
        <div class="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p><span class="font-medium">Nomor Pesanan:</span> {order.orderNumber}</p>
            <p><span class="font-medium">Tanggal:</span> {new Date(order.createdAt).toLocaleDateString('id-ID')}</p>
            <p><span class="font-medium">Status:</span> {order.status}</p>
          </div>
          <div class="text-right">
            <p><span class="font-medium">Total:</span> <span class="text-xl font-bold">{formatCurrency(order.totalAmount)}</span></p>
            <p><span class="font-medium">Metode:</span> {order.paymentMethod}</p>
            <p><span class="font-medium">Pengiriman:</span> {order.shippingMethod}</p>
          </div>
        </div>

        {#if order.orderItems && order.orderItems.length > 0}
          <div class="mb-4">
            <h3 class="font-semibold mb-2">Item Pesanan:</h3>
            <div class="overflow-x-auto">
              <table class="table table-sm">
                <thead>
                  <tr>
                    <th>Produk</th>
                    <th>Varian</th>
                    <th>Jumlah</th>
                    <th>Harga</th>
                    <th>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {#each order.orderItems as item}
                    <tr>
                      <td>{item.product.name}</td>
                      <td>{item.variant?.variantName || '-'}</td>
                      <td>{item.qty}</td>
                      <td>{formatCurrency(item.price)}</td>
                      <td>{formatCurrency(item.subtotal)}</td>
                    </tr>
                  {/each}
                </tbody>
              </table>
            </div>
          </div>
        {/if}

        {#if order.notes}
          <div class="mb-4">
            <p><span class="font-medium">Catatan:</span> {order.notes}</p>
          </div>
        {/if}
      </div>

      <div class="mb-6 p-4 bg-blue-50 rounded">
        <h3 class="text-lg font-semibold mb-4 text-center">Scan QRIS untuk Pembayaran</h3>
        {#if settings.qrisImage}
          <div class="flex justify-center">
            <img 
              src={settings.qrisImage} 
              alt="QRIS Payment Code" 
              class="w-64 h-64 object-contain border-2 border-gray-300 p-2 rounded-lg"
            />
          </div>
        {:else}
          <div class="flex justify-center items-center h-64 w-full bg-gray-200 border-2 border-dashed border-gray-400 rounded-lg">
            <span class="text-gray-500">QRIS Image Tidak Tersedia</span>
          </div>
        {/if}
      </div>

      <div class="mb-6 p-4 bg-green-50 rounded">
        <h3 class="text-lg font-semibold mb-2">Instruksi Pembayaran QRIS</h3>
        <div class="text-gray-700">
          {#if settings.qrisPaymentInstruction}
            {@html settings.qrisPaymentInstruction}
          {:else}
            <ol class="list-decimal list-inside space-y-1">
              <li>Buka aplikasi pembayaran yang mendukung QRIS (GoPay, OVO, Dana, dll)</li>
              <li>Pilih menu Scan QR atau kode QR</li>
              <li>Scan kode QR di atas</li>
              <li>Periksa rincian pembayaran dan konfirmasi pembayaran</li>
              <li>Simpan bukti pembayaran sebagai referensi</li>
            </ol>
          {/if}
        </div>
      </div>

      <div class="mb-6 p-4 bg-yellow-50 rounded">
        <h3 class="text-lg font-semibold mb-2">Total yang Harus Dibayar</h3>
        <div class="text-center text-3xl font-bold text-green-600">
          {formatCurrency(order.totalAmount)}
        </div>
      </div>

      <div class="flex justify-between">
        <button 
          class="btn btn-outline" 
          onclick={handleBackToHome}
        >
          Kembali ke Beranda
        </button>
        <button 
          class="btn btn-primary"
          onclick={() => {
            // Optionally, implement any additional logic like uploading payment proof
            alert('Terima kasih! Silakan kirim bukti pembayaran jika diminta oleh sistem kami.');
          }}
        >
          Konfirmasi Pembayaran
        </button>
      </div>
    </div>
  {/if}
</div>