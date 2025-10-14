<script lang="ts">
  import type { MarginReportData } from "$lib/types";

  export let reportData: MarginReportData;

  // Format currency
  function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  }

  // Format percentage
  function formatPercentage(value: number): string {
    return value.toFixed(2) + '%';
  }
</script>

<div class="bg-white p-6 rounded-xl shadow border">
  <h3 class="text-lg font-semibold mb-4">Detail Margin</h3>
  
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
    <!-- Product Margins -->
    <div>
      <h4 class="text-md font-medium mb-3">Margin Produk</h4>
      <div class="overflow-x-auto">
        <table class="table table-compact w-full">
          <thead>
            <tr>
              <th>Produk</th>
              <th>Biaya</th>
              <th>Pendapatan</th>
              <th>Laba</th>
              <th>Margin</th>
            </tr>
          </thead>
          <tbody>
            {#each reportData.productMargins as product}
              <tr>
                <td>{product.name}</td>
                <td>{formatCurrency(product.cost)}</td>
                <td>{formatCurrency(product.revenue)}</td>
                <td>{formatCurrency(product.profit)}</td>
                <td class="font-bold {product.margin >= 0 ? 'text-green-600' : 'text-red-600'}">
                  {formatPercentage(product.margin)}
                </td>
              </tr>
            {:else}
              <tr>
                <td colspan="5" class="text-center">Tidak ada data margin produk</td>
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
              <th>Total</th>
              <th>Margin</th>
            </tr>
          </thead>
          <tbody>
            {#each reportData.orders as order}
              <tr>
                <td>{order.orderNumber}</td>
                <td>{order.user.name}</td>
                <td>{formatCurrency(order.totalAmount)}</td>
                <td class="font-bold {order.margin >= 0 ? 'text-green-600' : 'text-red-600'}">
                  {formatPercentage(order.margin)}
                </td>
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