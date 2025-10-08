<script lang="ts">
  import type { Order } from "$lib/types";
  import { goto } from "$app/navigation";

  let { 
    orders, 
    isAdmin, 
    isStaff, 
    onEdit, 
    onDelete, 
    onSort, 
    sortKey, 
    sortDirection 
  }: { 
    orders: Order[];
    isAdmin: boolean;
    isStaff: boolean;
    onEdit: (order: Order) => void;
    onDelete: (order: Order) => void;
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

<div class="overflow-x-auto bg-base-100 rounded-lg shadow">
  <table class="table table-zebra">
    <thead>
      <tr>
        <th onclick={() => onSort('orderNumber')}>
          <div class="flex items-center gap-2">
            <span>Order #</span>
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
        <th onclick={() => onSort('status')}>
          <div class="flex items-center gap-2">
            <span>Status</span>
            {#if sortKey === 'status'}
              {#if sortDirection === 'asc'} ↑ {:else} ↓ {/if}
            {/if}
          </div>
        </th>
        <th onclick={() => onSort('paymentStatus')}>
          <div class="flex items-center gap-2">
            <span>Pembayaran</span>
            {#if sortKey === 'paymentStatus'}
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
        <th onclick={() => onSort('createdAt')}>
          <div class="flex items-center gap-2">
            <span>Tanggal</span>
            {#if sortKey === 'createdAt'}
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
            </td>
            <td>
              <div class="font-medium">{order.user.name}</div>
              <div class="text-sm opacity-70">{order.user.username}</div>
            </td>
            <td>
              <span class={`badge ${
                order.status === 'pending' ? 'badge-warning' :
                order.status === 'processing' ? 'badge-info' :
                order.status === 'finished' ? 'badge-success' :
                'badge-error'
              }`}>
                {order.status}
              </span>
            </td>
            <td>
              <span class={`badge ${
                order.paymentStatus === 'confirmed' ? 'badge-success' :
                order.paymentStatus === 'failed' ? 'badge-error' :
                order.paymentStatus === 'refunded' ? 'badge-neutral' :
                'badge-warning'
              }`}>
                {order.paymentStatus}
              </span>
            </td>
            <td>
              {formatCurrency(order.totalAmount)}
            </td>
            <td>
              {formatDate(order.createdAt)}
            </td>
            <td class="text-right">
              <div class="join">
                <button 
                  class="btn btn-xs btn-outline btn-info join-item"
                  onclick={() => goto(`/orders/${order.id}`)}
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
          <td colspan="7" class="text-center py-8">
            <div class="text-center">
              <div class="text-lg">Tidak ada order ditemukan</div>
            </div>
          </td>
        </tr>
      {/if}
    </tbody>
  </table>
</div>