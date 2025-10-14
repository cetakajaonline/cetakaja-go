<script lang="ts">
  import { formatCurrency, capitalizeFirstLetter } from "$lib/utils/formatters";
  import type { MarginReportData } from "$lib/types";

  export let reportData: MarginReportData | null | undefined;

  // Format percentage
  function formatPercentage(value: number): string {
    return value.toFixed(2) + '%';
  }

  // Function to determine the time period based on date range
  function getTimePeriodLabel(): string {
    if (reportData && reportData.date) {
      // For margin report, we'll use the date property if available
      const reportDate = new Date(reportData.date);
      return reportDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    }
    return 'Tahun Ini';
  }
</script>

{#if reportData}
  <!-- Product Margins Section -->
  {#if reportData.productMargins && reportData.productMargins.length > 0}
    <div class="mb-6">
      <h3 class="text-xl font-bold m-6 text-center">Margin Produk {getTimePeriodLabel()}</h3>
      <div class="overflow-x-auto">
        <table class="table table-zebra">
          <thead>
            <tr>
              <th>Nama Produk</th>
              <th class="text-right">Biaya</th>
              <th class="text-right">Pendapatan</th>
              <th class="text-right">Laba</th>
              <th class="text-right">Margin</th>
            </tr>
          </thead>
          <tbody>
            {#each reportData.productMargins as product}
              <tr>
                <td>{product.name}</td>
                <td class="text-right">{formatCurrency(product.cost)}</td>
                <td class="text-right">{formatCurrency(product.revenue)}</td>
                <td class="text-right">{formatCurrency(product.profit)}</td>
                <td class="text-right font-bold {product.margin >= 0 ? 'text-success' : 'text-error'}">
                  {formatPercentage(product.margin)}
                </td>
              </tr>
            {/each}
            <tr class="font-bold">
              <td>Total</td>
              <td class="text-right">
                {formatCurrency(
                  reportData.productMargins.reduce(
                    (sum, product) => sum + product.cost,
                    0
                  )
                )}
              </td>
              <td class="text-right">
                {formatCurrency(
                  reportData.productMargins.reduce(
                    (sum, product) => sum + product.revenue,
                    0
                  )
                )}
              </td>
              <td class="text-right">
                {formatCurrency(
                  reportData.productMargins.reduce(
                    (sum, product) => sum + product.profit,
                    0
                  )
                )}
              </td>
              <td class="text-right"></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  {/if}

  <!-- Order Details Section -->
  <div>
    <h3 class="text-xl font-bold m-6 text-center">Rincian Pesanan {getTimePeriodLabel()}</h3>
    {#if reportData.orders && reportData.orders.length > 0}
      <div class="overflow-x-auto">
        <table class="table table-zebra">
          <thead>
            <tr>
              <th>Tanggal</th>
              <th>No. Pesanan</th>
              <th>Nama Kasir</th>
              <th class="text-right">Total</th>
              <th class="text-right">Margin</th>
            </tr>
          </thead>
          <tbody>
            {#each reportData.orders as order}
              <tr>
                <td>{new Date(order.createdAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                <td>{order.orderNumber}</td>
                <td>{order.user.name}</td>
                <td class="text-right">{formatCurrency(order.totalAmount)}</td>
                <td class="text-right font-bold {order.margin >= 0 ? 'text-success' : 'text-error'}">
                  {formatPercentage(order.margin)}
                </td>
              </tr>
            {/each}
            <tr class="font-bold">
              <td></td>
              <td colspan="2">Total</td>
              <td class="text-right">
                {formatCurrency(
                  reportData.orders.reduce(
                    (sum, order) => sum + order.totalAmount,
                    0
                  )
                )}
              </td>
              <td class="text-right"></td>
            </tr>
          </tbody>
        </table>
      </div>
    {:else}
      <div class="alert alert-info">
        <div>
          <span>Tidak ada pesanan dalam periode ini.</span>
        </div>
      </div>
    {/if}
  </div>
{:else}
  <div class="text-center text-gray-500 py-8">Loading data...</div>
{/if}