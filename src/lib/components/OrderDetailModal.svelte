<script lang="ts">
  import Modal from "$lib/components/ui/Modal.svelte";
  import type { Order, User } from "$lib/types";
  import { updateOrder, uploadPaymentProof, getOrder } from "$lib/services/orderClient";

  let { 
    show = false, 
    order,
    user, // New prop for user info
    onOrderUpdate, // Callback to update order in parent store
    onClose
  }: {
    show: boolean;
    order: Order | null;
    user: User; // User info passed from parent
    onOrderUpdate: (updatedOrder: Order) => void; // Callback function
    onClose: () => void;
  } = $props();

  // Derived variables for access control
  let isAdmin = $derived(user?.role === "admin");
  let isStaff = $derived(user?.role === "staff");
  let isCustomer = $derived(user?.role === "customer");
  let canCancel = $derived((isCustomer && user.id === order?.userId) || (isAdmin || isStaff) && (order?.status === "pending" || order?.status === "processing"));
  let canUploadProof = $derived((isCustomer && user.id === order?.userId) || (isAdmin || isStaff) && 
                     (order?.paymentMethod === 'transfer' || order?.paymentMethod === 'qris') &&
                     (order?.status === 'pending' || order?.status === 'processing') && 
                     order?.paymentStatus !== 'confirmed');

  // State variables for actions
  let showCancelConfirm = $state(false);
  let showUploadProof = $state(false);
  let selectedPaymentProofFile: File | null = $state(null);
  let uploadProofLoading = $state(false);
  let uploadProofError = $state("");

  function closeModal() {
    onClose();
  }

  async function cancelOrder() {
    if (!order) return;
    try {
      const updatedOrder = await updateOrder(order.id, { status: "canceled" });
      // Notify parent component to update the store
      onOrderUpdate(updatedOrder);
      closeModal(); // Close modal after successful cancel
    } catch (error) {
      console.error("Failed to cancel order:", error);
      // Optionally, show an error notification
    } finally {
      showCancelConfirm = false;
    }
  }

  async function handleUploadProof() {
    if (!order || !selectedPaymentProofFile) return;

    const payment = order.payments[0]; // Take the first payment associated with the order
    if (!payment) {
      uploadProofError = "Tidak ada pembayaran terkait dengan order ini.";
      return;
    }

    uploadProofLoading = true;
    uploadProofError = "";

    try {
      await uploadPaymentProof(payment.id, selectedPaymentProofFile);
      // Fetch updated order data to reflect the new proof
      const updatedOrder = await getOrder(order.id);
      // Notify parent component to update the store
      onOrderUpdate(updatedOrder);
      closeModal(); // Close modal after successful upload
    } catch (error) {
      console.error("Failed to upload payment proof:", error);
      uploadProofError = error instanceof Error ? error.message : "Gagal mengupload bukti pembayaran.";
    } finally {
      uploadProofLoading = false;
    }
  }

  function openUploadProofModal() {
    showUploadProof = true;
    selectedPaymentProofFile = null;
    uploadProofError = "";
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
              <div class="flex">
                <div class="w-2/5 font-medium">Status :</div>
                <div class="w-3/5 text-right">
                  <span class={`badge ${order.status === 'pending' ? 'badge-warning' : order.status === 'processing' ? 'badge-info' : order.status === 'finished' ? 'badge-success' : 'badge-error'}`}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                </div>
              </div>
              <div class="flex">
                <div class="w-2/5 font-medium">Tanggal :</div>
                <div class="w-3/5 text-right">{formatDate(order.createdAt)}</div>
              </div>
              <div class="flex">
                <div class="w-2/5 font-medium">Diperbarui :</div>
                <div class="w-3/5 text-right">{formatDate(order.updatedAt)}</div>
              </div>
            </div>
          </div>

          <div class="bg-base-200 p-4 rounded-lg">
            <h4 class="font-semibold mb-2">Pembayaran</h4>
            <div class="space-y-1 text-sm">
              <div class="flex">
                <div class="w-2/5 font-medium">Metode :</div>
                <div class="w-3/5 text-right">
                  <span class={`badge ${order.paymentMethod === 'transfer' ? 'badge-primary' : order.paymentMethod === 'qris' ? 'badge-info' : 'badge-warning'}`}>
                    {order.paymentMethod === 'transfer' ? 'Transfer' : order.paymentMethod === 'qris' ? 'Qris' : 'Tunai'}
                  </span>
                </div>
              </div>
              <div class="flex">
                <div class="w-2/5 font-medium">Status :</div>
                <div class="w-3/5 text-right">
                  <span class={`badge ${order.paymentStatus === 'confirmed' ? 'badge-success' : order.paymentStatus === 'failed' ? 'badge-error' : order.paymentStatus === 'refunded' ? 'badge-neutral' : 'badge-warning'}`}>
                    {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                  </span>
                </div>
              </div>
              <div class="flex">
                <div class="w-2/5 font-medium">Total :</div>
                <div class="w-3/5 text-right">{formatCurrency(order.totalAmount)}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Customer Info and Shipping Info in 1 row, 2 columns -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="bg-base-200 p-4 rounded-lg">
            <h4 class="font-semibold mb-2">Pelanggan</h4>
            <div class="space-y-1 text-sm">
              <div class="flex">
                <div class="w-2/5 font-medium">Nama :</div>
                <div class="w-3/5 text-right">{order.user.name}</div>
              </div>
              <div class="flex">
                <div class="w-2/5 font-medium">No Telp :</div>
                <div class="w-3/5 text-right">{order.user.phone}</div>
              </div>
            </div>
          </div>

          <div class="bg-base-200 p-4 rounded-lg">
            <h4 class="font-semibold mb-2">Pengiriman</h4>
            <div class="space-y-1 text-sm">
              <div class="flex">
                <div class="w-2/5 font-medium">Metode :</div>
                <div class="w-3/5 text-right">
                  <span class={`badge ${order.shippingMethod === 'pickup' ? 'badge-neutral' : 'badge-info'}`}>
                    {order.shippingMethod === 'pickup' ? 'Pickup' : 'Delivery'}
                  </span>
                </div>
              </div>
              <div class="flex">
                <div class="w-2/5 font-medium">Alamat :</div>
                <div class="w-3/5 text-right">{order.user.address || 'Tidak ada alamat'}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Order Items -->
        <div class="bg-base-200 p-4 rounded-lg">
          <h4 class="font-semibold mb-2">Item Pesanan</h4>
          <!-- Mobile Card Layout -->
          <div class="block sm:hidden">
            {#each order.orderItems as item}
              <div class="border-b border-gray-200 pb-3 mb-3 last:border-0 last:pb-0 last:mb-0">
                <div class="space-y-1 text-sm">
                  <div class="flex">
                    <div class="w-2/5 font-medium">Produk:</div>
                    <div class="w-3/5 text-right">{item.product.name}</div>
                  </div>
                  <div class="flex">
                    <div class="w-2/5 font-medium">Varian:</div>
                    <div class="w-3/5 text-right">{item.variant?.variantName || '-'}</div>
                  </div>
                  <div class="flex">
                    <div class="w-2/5 font-medium">Link Desain:</div>
                    <div class="w-3/5 text-right">
                      {#if item.notes}
                        <a href="{item.notes}" target="_blank" class="text-blue-600 hover:underline break-all">
                          Lihat Desain
                        </a>
                      {:else}
                        -
                      {/if}
                    </div>
                  </div>
                  <div class="flex">
                    <div class="w-2/5 font-medium">Qty:</div>
                    <div class="w-3/5 text-right">{item.qty}</div>
                  </div>
                  <div class="flex">
                    <div class="w-2/5 font-medium">Harga:</div>
                    <div class="w-3/5 text-right">{formatCurrency(item.price)}</div>
                  </div>
                  <div class="flex">
                    <div class="w-2/5 font-medium">Subtotal:</div>
                    <div class="w-3/5 text-right">{formatCurrency(item.subtotal)}</div>
                  </div>
                </div>
              </div>
            {/each}
            <div class="flex border-t border-gray-200 pt-2 mt-2">
              <div class="w-2/5 font-bold">Total:</div>
              <div class="w-3/5 text-right font-bold">{formatCurrency(order.totalAmount)}</div>
            </div>
          </div>
          
          <!-- Desktop Table Layout -->
          <div class="hidden sm:block overflow-x-auto">
            <table class="table table-compact w-full">
              <thead>
                <tr>
                  <th>Produk</th>
                  <th>Varian</th>
                  <th>Link Desain</th>
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
                    <td>
                      {#if item.notes}
                        <a href="{item.notes}" target="_blank" class="text-blue-600 hover:underline break-all">
                          Lihat Desain
                        </a>
                      {:else}
                        -
                      {/if}
                    </td>
                    <td class="text-right">{item.qty}</td>
                    <td class="text-right">{formatCurrency(item.price)}</td>
                    <td class="text-right">{formatCurrency(item.subtotal)}</td>
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
                      <div class="rounded p-2">
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
                                class="w-full max-h-64 object-contain rounded cursor-pointer hover:opacity-90"
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

      <div class="modal-action flex justify-end space-x-2">
        <!-- Upload Payment Proof Button for Customer -->
        {#if canUploadProof}
          <button
            onclick={openUploadProofModal}
            class="btn btn-primary btn-outline"
          >
            Upload Bukti
          </button>
        {/if}

        <!-- Cancel Button for Customer -->
        {#if canCancel}
          <button
            onclick={() => showCancelConfirm = true}
            class="btn btn-warning btn-outline"
          >
            Batalkan
          </button>
        {/if}

        <button 
          class="btn btn-circle btn-error btn-outline" 
          onclick={closeModal}
          aria-label="Close"
        >
          ✕
        </button>
      </div>
    </div>
  </Modal>

  <!-- Confirm Cancel Modal -->
  {#if showCancelConfirm}
    <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-base-100 p-6 rounded-lg shadow-lg max-w-md w-full">
        <h3 class="text-lg font-semibold mb-4">Konfirmasi Pembatalan</h3>
        <p>Yakin ingin membatalkan order <strong>#{order?.orderNumber}</strong>?</p>
        <div class="flex justify-end space-x-4 mt-6">
          <button
            onclick={() => showCancelConfirm = false}
            class="btn btn-ghost"
          >
            Batal
          </button>
          <button
            onclick={cancelOrder}
            class="btn btn-error"
          >
            Konfirmasi
          </button>
        </div>
      </div>
    </div>
  {/if}

  <!-- Upload Payment Proof Modal -->
  {#if showUploadProof}
    <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-base-100 p-6 rounded-lg shadow-lg max-w-md w-full">
        <h3 class="text-lg font-semibold mb-4">Upload Bukti Pembayaran</h3>
        <div class="mb-4">
          <label class="label" for="payment-proof-file">
            <span class="label-text">Pilih File</span>
          </label>
          <input
            id="payment-proof-file"
            type="file"
            accept="image/jpeg, image/jpg, image/png, application/pdf"
            onchange={(e) => selectedPaymentProofFile = (e.target as HTMLInputElement).files?.[0] || null}
            class="file-input file-input-bordered file-input-primary w-full max-w-xs"
          />
        </div>
        {#if uploadProofError}
          <div class="mb-4 text-error text-sm">{uploadProofError}</div>
        {/if}
        <div class="flex justify-end space-x-4">
          <button
            onclick={() => showUploadProof = false}
            class="btn btn-ghost"
          >
            Batal
          </button>
          <button
            onclick={handleUploadProof}
            disabled={uploadProofLoading}
            class="btn btn-primary"
          >
            {uploadProofLoading ? "Mengupload..." : "Upload"}
          </button>
        </div>
      </div>
    </div>
  {/if}
{/if}