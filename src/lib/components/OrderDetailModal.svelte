<script lang="ts">
  import Modal from "$lib/components/ui/Modal.svelte";
  import type { Order } from "$lib/types";

  let { 
    show = false, 
    order,
    onClose
  }: {
    show: boolean;
    order: Order | null;
    onClose: () => void;
  } = $props();

  function closeModal() {
    onClose();
  }

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

{#if show && order}
  <Modal {show} size="xl" on:close={closeModal}>
    <div>
      <div class="flex justify-between items-start mb-4">
        <div>
          <h2 class="text-xl font-bold mb-2">Detail Order : {order.orderNumber}</h2>
        </div>
        <button 
          class="btn btn-sm btn-circle btn-ghost"
          onclick={closeModal}
          aria-label="Close"
        >
          ✕
        </button>
      </div>

      <div class="my-6 space-y-6">
        <!-- Order Info -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="bg-base-200 p-4 rounded-lg">
            <h4 class="font-semibold mb-2">Informasi Order</h4>
            <div class="space-y-1 text-sm">
              <div><span class="font-medium">Status:</span> 
                <span class={`ml-2 badge ${order.status === 'pending' ? 'badge-warning' : order.status === 'processing' ? 'badge-info' : order.status === 'finished' ? 'badge-success' : 'badge-error'}`}>
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </span>
              </div>
              <div><span class="font-medium">Tanggal:</span> {formatDate(order.createdAt)}</div>
              <div><span class="font-medium">Diperbarui:</span> {formatDate(order.updatedAt)}</div>
            </div>
          </div>

          <div class="bg-base-200 p-4 rounded-lg">
            <h4 class="font-semibold mb-2">Pembayaran</h4>
            <div class="space-y-1 text-sm">
              <div><span class="font-medium">Metode:</span> 
                <span class={`badge ${
                  order.paymentMethod === 'transfer' ? 'badge-primary' :
                  order.paymentMethod === 'qris' ? 'badge-info' :
                  'badge-warning'
                }`}>
                  {order.paymentMethod === 'transfer' ? 'Transfer' : order.paymentMethod === 'qris' ? 'Qris' : 'Tunai'}
                </span>
              </div>
              <div><span class="font-medium">Status:</span> 
                <span class={`ml-2 badge ${order.paymentStatus === 'confirmed' ? 'badge-success' : order.paymentStatus === 'failed' ? 'badge-error' : order.paymentStatus === 'refunded' ? 'badge-neutral' : 'badge-warning'}`}>
                  {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                </span>
              </div>
              <div><span class="font-medium">Total:</span> {formatCurrency(order.totalAmount)}</div>
            </div>
          </div>
        </div>

        <!-- Customer Info and Shipping Info in 1 row, 2 columns -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="bg-base-200 p-4 rounded-lg">
            <h4 class="font-semibold mb-2">Pelanggan</h4>
            <div class="space-y-1 text-sm">
              <div><span class="font-medium">Nama:</span> {order.user.name}</div>
              <div><span class="font-medium">No Telp:</span> {order.user.phone}</div>
            </div>
          </div>

          <div class="bg-base-200 p-4 rounded-lg">
            <h4 class="font-semibold mb-2">Pengiriman</h4>
            <div class="space-y-1 text-sm">
              <div><span class="font-medium">Metode:</span> 
                <span class={`badge ${
                  order.shippingMethod === 'pickup' ? 'badge-neutral' : 'badge-info'
                }`}>
                  {order.shippingMethod === 'pickup' ? 'Pickup' : 'Delivery'}
                </span>
              </div>
              <div><span class="font-medium">Alamat:</span> {order.user.address || 'Tidak ada alamat'}</div>
            </div>
          </div>
        </div>

        <!-- Order Items -->
        <div class="bg-base-200 p-4 rounded-lg">
          <h4 class="font-semibold mb-2">Item Pesanan</h4>
          <div class="overflow-x-auto">
            <table class="table table-compact">
              <thead>
                <tr>
                  <th>Produk</th>
                  <th>Varian</th>
                  <th class="text-right">Qty</th>
                  <th class="text-right">Harga</th>
                  <th class="text-right">Subtotal</th>
                  <th>Link Desain</th>
                </tr>
              </thead>
              <tbody>
                {#each order.orderItems as item}
                  <tr>
                    <td>{item.product.name}</td>
                    <td>{item.variant?.variantName || '-'}</td>
                    <td class="text-right">{item.qty}</td>
                    <td class="text-right">{formatCurrency(item.price)}</td>
                    <td class="text-right">{formatCurrency(item.subtotal)}</td>
                    <td>
                      {#if item.notes}
                        <a href="{item.notes}" target="_blank" class="text-blue-600 hover:underline break-all">
                          Lihat Desain
                        </a>
                      {:else}
                        -
                      {/if}
                    </td>
                  </tr>
                {/each}
              </tbody>
              <tfoot>
                <tr>
                  <td colspan="5" class="text-right font-semibold">Total:</td>
                  <td class="text-right font-bold">{formatCurrency(order.totalAmount)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        <!-- Payment Proof for transfer and qris methods -->
        {#if order && (order.paymentMethod?.toLowerCase() === 'transfer' || order.paymentMethod?.toLowerCase() === 'qris')}
          {#if order.payments && order.payments.length > 0}
            <!-- Show payments with proofs -->
            {#each order.payments as payment}
              {#if payment.proofs && payment.proofs.length > 0}
                <div class="bg-base-200 p-4 rounded-lg">
                  <h4 class="font-semibold mb-2">Bukti Pembayaran</h4>
                  <div class="space-y-2">
                    {#each payment.proofs as proof}
                      <div class="border rounded p-2">
                        <div class="flex items-center justify-between">
                          <div class="flex items-center">
                            {#if proof.fileType.startsWith('image/')}
                              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-info" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            {:else}
                              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-info" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                            {/if}
                            <span class="text-sm">{proof.fileName}</span>
                          </div>
                          <div class="text-xs text-gray-500">
                            {new Date(proof.uploadedAt).toLocaleDateString('id-ID')}
                          </div>
                        </div>
                        
                        <!-- Preview or download link -->
                        <div class="mt-2">
                          {#if proof.fileType.startsWith('image/')}
                            <a 
                              href="{proof.filePath}" 
                              target="_blank"
                              class="block"
                            >
                              <img 
                                src="{proof.filePath}" 
                                alt="Preview Bukti Pembayaran" 
                                class="max-w-xs max-h-64 border rounded cursor-pointer hover:opacity-90"
                              />
                            </a>
                          {:else}
                            <a 
                              href="{proof.filePath}" 
                              target="_blank"
                              class="btn btn-xs btn-primary"
                            >
                              Download File
                            </a>
                          {/if}
                        </div>
                      </div>
                    {/each}
                  </div>
                </div>
              {/if}
            {/each}
            
            <!-- Show message if no proofs exist but payment is pending -->
            {#if order.payments.every(payment => !payment.proofs || payment.proofs.length === 0)}
              <div class="bg-warning p-4 rounded-lg text-warning-content">
                <h4 class="font-semibold mb-2">Bukti Pembayaran Belum Diupload</h4>
                <p class="text-sm">Pembayaran dengan metode transfer ini belum memiliki bukti pembayaran yang diupload.</p>
              </div>
            {/if}
          {/if}
        {/if}

        <!-- Notes -->
        {#if order.notes}
          <div class="bg-base-200 p-4 rounded-lg">
            <h4 class="font-semibold mb-2">Catatan</h4>
            <div class="text-sm">{order.notes}</div>
          </div>
        {/if}
      </div>

      <div class="modal-action flex justify-end">
        <button 
          class="btn btn-outline" 
          onclick={closeModal}
        >
          Tutup
        </button>
      </div>
    </div>
  </Modal>
{/if}