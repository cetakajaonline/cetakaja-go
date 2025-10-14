<script lang="ts">
  import type { RevenueReportData } from "$lib/types";

  export let reportData: RevenueReportData | null | undefined;

  // Format currency
  function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  }
</script>

{#if reportData}
  <div class="bg-white p-6 rounded-xl shadow border">
    <h3 class="text-lg font-semibold mb-4">Detail Pendapatan</h3>
    
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <!-- Top Revenue Products -->
      <div>
        <h4 class="text-md font-medium mb-3">Produk Pendapatan Terbesar</h4>
        <div class="overflow-x-auto">
          <table class="table table-compact w-full">
            <thead>
              <tr>
                <th>Produk</th>
                <th>Terjual</th>
                <th>Pendapatan</th>
              </tr>
            </thead>
            <tbody>
              {#each reportData.topRevenueProducts as product}
                <tr>
                  <td>{product.name}</td>
                  <td>{product.totalSold}</td>
                  <td>{formatCurrency(product.totalRevenue)}</td>
                </tr>
              {:else}
                <tr>
                  <td colspan="3" class="text-center">Tidak ada data produk</td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Order Details -->
      <div>
        <h4 class="text-md font-medium mb-3">Daftar Pesanan</h4>
        <div class="overflow-x-auto">
          <table class="table table-compact w-full">
            <thead>
              <tr>
                <th>No. Pesanan</th>
                <th>Pelanggan</th>
                <th>Metode Pembayaran</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {#each reportData.orders as order}
                <tr>
                  <td>{order.orderNumber}</td>
                  <td>{order.user.name}</td>
                  <td>
                    <span class="badge badge-primary">
                      {order.paymentMethod === 'transfer' ? 'Transfer' : 
                       order.paymentMethod === 'qris' ? 'QRIS' : 'Tunai'}
                    </span>
                  </td>
                  <td>{formatCurrency(order.totalAmount)}</td>
                </tr>
              {:else}
                <tr>
                  <td colspan="4" class="text-center">Tidak ada data pesanan</td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
{:else}
  <div class="bg-white p-6 rounded-xl shadow border">
    <h3 class="text-lg font-semibold mb-4">Detail Pendapatan</h3>
    <div class="text-center text-gray-500 py-8">Loading data...</div>
  </div>
{/if}