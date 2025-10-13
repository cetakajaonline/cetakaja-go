<script lang="ts">
  import type { Order } from "$lib/types";

  let { 
    orders, 
    isAdmin, 
    isStaff, 
    onEdit, 
    onDelete, 
    onDetail,
    onSort, 
    sortKey, 
    sortDirection 
  }: { 
    orders: Order[];
    isAdmin: boolean;
    isStaff: boolean;
    onEdit: (order: Order) => void;
    onDelete: (order: Order) => void;
    onDetail: (order: Order) => void;
    onSort: (key: keyof Order) => void;
    sortKey: keyof Order;
    sortDirection: "asc" | "desc";
  } = $props();

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

<div class="bg-base-100 rounded-lg shadow">
  <!-- Mobile Card Layout - Show All Data -->
  <div class="block sm:hidden">
    {#if orders.length > 0}
      {#each orders as order (order.id)}
        <div class="p-4">
          <div class="font-bold text-lg mb-2">{order.orderNumber}</div>
          <div class="text-sm opacity-70 mb-3">{formatDate(order.createdAt)}</div>
          
          <div class="space-y-2 mb-4">
            <div class="flex">
              <div class="w-2/5 font-semibold">Pelanggan:</div>
              <div class="w-3/5 text-right">
                <div class="font-medium">{order.user.name}</div>
                <div>{order.user.phone}</div>
              </div>
            </div>
            
            <div class="flex">
              <div class="w-2/5 font-semibold">Total:</div>
              <div class="w-3/5 text-right font-medium">{formatCurrency(order.totalAmount)}</div>
            </div>
            
            <div class="flex">
              <div class="w-2/5 font-semibold">Metode Pembayaran:</div>
              <div class="w-3/5 text-right">
                <span class={`badge ${order.paymentMethod === 'transfer' ? 'badge-primary' : order.paymentMethod === 'qris' ? 'badge-info' : 'badge-warning'}`}>
                  {order.paymentMethod.charAt(0).toUpperCase() + order.paymentMethod.slice(1)}
                </span>
              </div>
            </div>
            
            <div class="flex">
              <div class="w-2/5 font-semibold">Status Pembayaran:</div>
              <div class="w-3/5 text-right">
                <span class={`badge ${order.paymentStatus === 'confirmed' ? 'badge-success' : order.paymentStatus === 'failed' ? 'badge-error' : order.paymentStatus === 'refunded' ? 'badge-info' : 'badge-warning'}`}>
                  {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                </span>
              </div>
            </div>
            
            <div class="flex">
              <div class="w-2/5 font-semibold">Metode Pengiriman:</div>
              <div class="w-3/5 text-right">
                <span class={`badge ${order.shippingMethod === 'pickup' ? 'badge-info' : 'badge-success'}`}>
                  {order.shippingMethod.charAt(0).toUpperCase() + order.shippingMethod.slice(1)}
                </span>
              </div>
            </div>
            
            <div class="flex">
              <div class="w-2/5 font-semibold">Status Order:</div>
              <div class="w-3/5 text-right">
                <span class={`badge ${order.status === 'pending' ? 'badge-warning' : order.status === 'processing' ? 'badge-info' : order.status === 'finished' ? 'badge-success' : 'badge-error'}`}>
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </span>
              </div>
            </div>
          </div>
          
          <!-- Actions at the bottom -->
          <div class="flex mt-4">
            <div class="join w-full">
              <button 
                class="btn btn-sm btn-outline btn-info join-item flex-1"
                onclick={() => onDetail(order)}
              >
                Detail
              </button>
              {#if isAdmin || isStaff}
                <button 
                  class="btn btn-sm btn-outline btn-warning join-item flex-1"
                  onclick={() => onEdit(order)}
                >
                  Edit
                </button>
                <button 
                  class="btn btn-sm btn-outline btn-error join-item flex-1"
                  onclick={() => onDelete(order)}
                >
                  Hapus
                </button>
              {/if}
            </div>
          </div>
        </div>
      {/each}
    {:else}
      <div class="text-center py-8">
        <div class="text-lg">Tidak ada order ditemukan</div>
      </div>
    {/if}
  </div>
  
  <!-- Desktop Table Layout -->
  <div class="hidden sm:block overflow-x-auto max-w-full">
    <table class="table table-zebra w-full">
      <thead>
        <tr>
          <th onclick={() => onSort('orderNumber')}>
            <div class="flex items-center gap-2">
              <span>OrderID</span>
              {#if sortKey === 'orderNumber'}
                {#if sortDirection === 'asc'} ↑ {:else} ↓ {/if}
              {/if}
            </div>
          </th>
          <th onclick={() => onSort('user')}>
            <div class="flex items-center gap-2">
              <span>Pelanggan</span>
              {#if sortKey === 'user'}
                {#if sortDirection === 'asc'} ↑ {:else} ↓ {/if}
              {/if}
            </div>
          </th>
          <th onclick={() => onSort('totalAmount')}>
            <div class="flex items-center gap-2">
              <span>Total</span>
              {#if sortKey === 'totalAmount'}
                {#if sortDirection === 'asc'} ↑ {:else} ↓ {/if}
              {/if}
            </div>
          </th>
          <th onclick={() => onSort('paymentMethod')}>
            <div class="flex items-center gap-2">
              <span>Metode Pembayaran</span>
              {#if sortKey === 'paymentMethod'}
                {#if sortDirection === 'asc'} ↑ {:else} ↓ {/if}
              {/if}
            </div>
          </th>
          <th onclick={() => onSort('paymentStatus')}>
            <div class="flex items-center gap-2">
              <span>Status Pembayaran</span>
              {#if sortKey === 'paymentStatus'}
                {#if sortDirection === 'asc'} ↑ {:else} ↓ {/if}
              {/if}
            </div>
          </th>
          <th onclick={() => onSort('shippingMethod')}>
            <div class="flex items-center gap-2">
              <span>Metode Pengiriman</span>
              {#if sortKey === 'shippingMethod'}
                {#if sortDirection === 'asc'} ↑ {:else} ↓ {/if}
              {/if}
            </div>
          </th>
          <th onclick={() => onSort('status')}>
            <div class="flex items-center gap-2">
              <span>Status Order</span>
              {#if sortKey === 'status'}
                {#if sortDirection === 'asc'} ↑ {:else} ↓ {/if}
              {/if}
            </div>
          </th>
          <th class="text-right">Aksi</th>
        </tr>
      </thead>
      <tbody>
        {#if orders.length > 0}
          {#each orders as order (order.id)}
            <tr class="hover">
              <td>
                <div class="font-medium">{order.orderNumber}</div>
                <div class="text-sm opacity-70">{formatDate(order.createdAt)}</div>
              </td>
              <td>
                <div class="font-medium">{order.user.name}</div>
                <div class="text-sm opacity-70">{order.user.phone}</div>
              </td>
              <td>
                {formatCurrency(order.totalAmount)}
              </td>
              <td>
                <span class={`badge ${order.paymentMethod === 'transfer' ? 'badge-primary' : order.paymentMethod === 'qris' ? 'badge-info' : 'badge-warning'}`}>
                  {order.paymentMethod.charAt(0).toUpperCase() + order.paymentMethod.slice(1)}
                </span>
              </td>
              <td>
                <span class={`badge ${order.paymentStatus === 'confirmed' ? 'badge-success' : order.paymentStatus === 'failed' ? 'badge-error' : order.paymentStatus === 'refunded' ? 'badge-info' : 'badge-warning'}`}>
                  {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                </span>
              </td>
              <td>
                <span class={`badge ${order.shippingMethod === 'pickup' ? 'badge-info' : 'badge-success'}`}>
                  {order.shippingMethod.charAt(0).toUpperCase() + order.shippingMethod.slice(1)}
                </span>
              </td>
              <td>
                <span class={`badge ${order.status === 'pending' ? 'badge-warning' : order.status === 'processing' ? 'badge-info' : order.status === 'finished' ? 'badge-success' : 'badge-error'}`}>
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </span>
              </td>
              <td class="text-right">
                <div class="join">
                  <button 
                    class="btn btn-xs btn-outline btn-info join-item"
                    onclick={() => onDetail(order)}
                  >
                    Detail
                  </button>
                  {#if isAdmin || isStaff}
                    <button 
                      class="btn btn-xs btn-outline btn-warning join-item"
                      onclick={() => onEdit(order)}
                    >
                      Edit
                    </button>
                    <button 
                      class="btn btn-xs btn-outline btn-error join-item"
                      onclick={() => onDelete(order)}
                    >
                      Hapus
                    </button>
                  {/if}
                </div>
              </td>
            </tr>
          {/each}
        {:else}
          <tr>
            <td colspan="8" class="text-center py-8">
              <div class="text-center">
                <div class="text-lg">Tidak ada order ditemukan</div>
              </div>
            </td>
          </tr>
        {/if}
      </tbody>
    </table>
  </div>
</div>