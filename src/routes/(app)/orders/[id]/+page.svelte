<script lang="ts">
  import { onMount } from "svelte";
  import { browser } from "$app/environment";
  import { goto } from "$app/navigation";
  import { getOrder } from "$lib/services/orderClient";

  let { data }: { data: { order: import("$lib/types").Order; user: import("$lib/types").User } } = $props();

  let { order, user } = data;
  let isAdmin = user.role === "admin";
  let isStaff = user.role === "staff";
  let canEdit = isAdmin || isStaff;
  
  function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  }

  function formatDate(dateString: string | Date): string {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
</script>

<div class="p-6">
  <div class="mb-6 flex justify-between items-center">
    <div>
      <h1 class="text-2xl font-bold text-gray-800">Detail Order</h1>
      <p class="text-gray-600">#{order.orderNumber}</p>
    </div>
    <div>
      <button
        onclick={() => goto('/orders')}
        class="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
      >
        Kembali
      </button>
    </div>
  </div>

  <!-- Order Info -->
  <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
    <div class="bg-white p-6 rounded-lg shadow">
      <h2 class="text-lg font-semibold mb-4">Informasi Order</h2>
      <div class="space-y-2">
        <div class="flex">
          <span class="w-40 text-gray-600">Nomor Order:</span>
          <span class="font-medium">{order.orderNumber}</span>
        </div>
        <div class="flex">
          <span class="w-40 text-gray-600">Status:</span>
          <span class={`font-medium ${
            order.status === 'pending' ? 'text-yellow-600' :
            order.status === 'processing' ? 'text-blue-600' :
            order.status === 'finished' ? 'text-green-600' :
            'text-red-600'
          }`}>
            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
          </span>
        </div>
        <div class="flex">
          <span class="w-40 text-gray-600">Metode Pengiriman:</span>
          <span class="font-medium">{order.shippingMethod === 'pickup' ? 'Ambil Sendiri' : 'Dikirim'}</span>
        </div>
        {#if order.shippingAddress}
        <div class="flex">
          <span class="w-40 text-gray-600">Alamat Pengiriman:</span>
          <span class="font-medium">{order.shippingAddress}</span>
        </div>
        {/if}
        <div class="flex">
          <span class="w-40 text-gray-600">Metode Pembayaran:</span>
          <span class="font-medium">{order.paymentMethod === 'transfer' ? 'Transfer Bank' : order.paymentMethod === 'qris' ? 'QRIS' : 'Tunai'}</span>
        </div>
        <div class="flex">
          <span class="w-40 text-gray-600">Status Pembayaran:</span>
          <span class={`font-medium ${
            order.paymentStatus === 'confirmed' ? 'text-green-600' :
            order.paymentStatus === 'failed' ? 'text-red-600' :
            order.paymentStatus === 'refunded' ? 'text-gray-600' :
            'text-yellow-600'
          }`}>
            {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
          </span>
        </div>
        <div class="flex">
          <span class="w-40 text-gray-600">Total:</span>
          <span class="font-medium text-lg">{formatCurrency(order.totalAmount)}</span>
        </div>
        <div class="flex">
          <span class="w-40 text-gray-600">Tanggal:</span>
          <span class="font-medium">{formatDate(order.createdAt)}</span>
        </div>
      </div>
    </div>

    <div class="bg-white p-6 rounded-lg shadow">
      <h2 class="text-lg font-semibold mb-4">Informasi Pelanggan</h2>
      <div class="space-y-2">
        <div class="flex">
          <span class="w-40 text-gray-600">Nama:</span>
          <span class="font-medium">{order.user.name}</span>
        </div>
        <div class="flex">
          <span class="w-40 text-gray-600">Username:</span>
          <span class="font-medium">{order.user.username}</span>
        </div>
        {#if order.createdBy}
        <div class="flex">
          <span class="w-40 text-gray-600">Dibuat oleh:</span>
          <span class="font-medium">{order.createdBy.name} ({order.createdBy.username})</span>
        </div>
        {/if}
      </div>
    </div>
  </div>

  <!-- Order Items -->
  <div class="bg-white p-6 rounded-lg shadow mb-6">
    <h2 class="text-lg font-semibold mb-4">Item Pesanan</h2>
    <div class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Produk</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Varian</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Harga</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subtotal</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          {#each order.orderItems as item}
            <tr>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">{item.product.name}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-500">{item.variant?.variantName || '-'}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {item.qty}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {formatCurrency(item.price)}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {formatCurrency(item.subtotal)}
              </td>
            </tr>
          {/each}
        </tbody>
        <tfoot class="bg-gray-50">
          <tr>
            <td colspan="4" class="px-6 py-3 text-right text-sm font-medium text-gray-900">Total</td>
            <td class="px-6 py-3 text-sm font-medium text-gray-900">{formatCurrency(order.totalAmount)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  </div>

  <!-- Edit Button -->
  {#if canEdit}
    <div class="flex justify-end space-x-4">
      <button
        onclick={() => goto(`/orders/${order.id}/edit`)}
        class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
      >
        Edit Order
      </button>
    </div>
  {/if}
</div>