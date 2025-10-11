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
  <h1 class="text-2xl md:text-3xl font-bold text-center mb-8">Pembayaran Transfer Bank</h1>

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
        <h3 class="text-lg font-semibold mb-4">Detail Transfer Bank</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p><span class="font-medium">Nama Bank:</span></p>
            {#if settings.bankName}
              <p class="text-xl font-bold">{settings.bankName}</p>
            {:else}
              <p class="text-gray-500">Tidak Tersedia</p>
            {/if}
          </div>
          <div>
            <p><span class="font-medium">Kode Bank:</span></p>
            {#if settings.bankCode}
              <p class="text-xl font-bold">{settings.bankCode}</p>
            {:else}
              <p class="text-gray-500">Tidak Tersedia</p>
            {/if}
          </div>
          <div class="md:col-span-2">
            <p><span class="font-medium">Nomor Rekening:</span></p>
            {#if settings.bankAccountNumber}
              <p class="text-2xl font-bold font-mono">{settings.bankAccountNumber}</p>
            {:else}
              <p class="text-gray-500">Tidak Tersedia</p>
            {/if}
          </div>
          <div class="md:col-span-2">
            <p><span class="font-medium">Atas Nama:</span></p>
            {#if settings.bankAccountName}
              <p class="text-xl">{settings.bankAccountName}</p>
            {:else}
              <p class="text-gray-500">Tidak Tersedia</p>
            {/if}
          </div>
        </div>
      </div>

      <div class="mb-6 p-4 bg-green-50 rounded">
        <h3 class="text-lg font-semibold mb-2">Jumlah yang Harus Ditransfer</h3>
        <div class="text-center text-3xl font-bold text-green-600">
          {formatCurrency(order.totalAmount)}
        </div>
      </div>

      <div class="mb-6 p-4 bg-yellow-50 rounded">
        <h3 class="text-lg font-semibold mb-2">Instruksi Pembayaran Transfer Bank</h3>
        <div class="text-gray-700">
          {#if settings.bankTransferInstruction}
            {@html settings.bankTransferInstruction}
          {:else}
            <ol class="list-decimal list-inside space-y-1">
              <li>Login ke aplikasi mobile banking atau internet banking bank Anda</li>
              <li>Pilih menu Transfer ke Rekening Bank Lain</li>
              <li>Masukkan kode bank ({settings.bankCode || 'Kode bank belum diatur'}) dan nomor rekening ({settings.bankAccountNumber || 'Nomor rekening belum diatur'})</li>
              <li>Masukkan jumlah transfer sebesar {formatCurrency(order.totalAmount)}</li>
              <li>Lanjutkan proses transfer sesuai instruksi aplikasi</li>
              <li>Simpan bukti transfer sebagai referensi</li>
            </ol>
          {/if}
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
            alert('Terima kasih! Silakan kirim bukti transfer melalui menu yang tersedia atau hubungi kami.');
          }}
        >
          Konfirmasi Pembayaran
        </button>
      </div>
    </div>
  {/if}
</div>