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
          <h2 class="text-xl font-bold mb-2">Detail Order</h2>
          <h3 class="text-lg font-semibold">{order.orderNumber}</h3>
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
              <div><span class="font-medium">Metode:</span> {order.paymentMethod}</div>
              <div><span class="font-medium">Status:</span> 
                <span class={`ml-2 badge ${order.paymentStatus === 'confirmed' ? 'badge-success' : order.paymentStatus === 'failed' ? 'badge-error' : order.paymentStatus === 'refunded' ? 'badge-neutral' : 'badge-warning'}`}>
                  {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                </span>
              </div>
              <div><span class="font-medium">Total:</span> {formatCurrency(order.totalAmount)}</div>
            </div>
          </div>
        </div>

        <!-- Customer Info -->
        <div class="bg-base-200 p-4 rounded-lg">
          <h4 class="font-semibold mb-2">Pelanggan</h4>
          <div class="space-y-1 text-sm">
            <div><span class="font-medium">Nama:</span> {order.user.name}</div>
            <div><span class="font-medium">Username:</span> {order.user.username}</div>
          </div>
        </div>

        <!-- Shipping Info -->
        <div class="bg-base-200 p-4 rounded-lg">
          <h4 class="font-semibold mb-2">Pengiriman</h4>
          <div class="space-y-1 text-sm">
            <div><span class="font-medium">Metode:</span> {order.shippingMethod}</div>
            <div><span class="font-medium">Alamat:</span> {order.user.address || 'Tidak ada alamat'}</div>
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
                  </tr>
                {/each}
              </tbody>
              <tfoot>
                <tr>
                  <td colspan="4" class="text-right font-semibold">Total:</td>
                  <td class="text-right font-bold">{formatCurrency(order.totalAmount)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
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