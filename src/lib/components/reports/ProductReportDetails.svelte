<script lang="ts">
  import {
    formatCurrency,
    formatDate,
    getStatusClass,
    getStatusDisplayText,
    capitalizeFirstLetter,
  } from "$lib/utils/formatters";
  import type { ProductReportData } from "$lib/types";

  export let reportData: ProductReportData;

  // Function to determine the time period based on date range
  function getTimePeriodLabel(): string {
    if (reportData.startDate && reportData.endDate) {
      const startDate = new Date(reportData.startDate);
      const endDate = new Date(reportData.endDate);
      
      // Calculate the difference in days
      const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      // If it's exactly 1 day, it's daily
      if (diffDays === 1) {
        return 'Harian';
      } 
      // If it's 7 days, it's weekly
      else if (diffDays === 7) {
        return 'Minggu Ini';
      } 
      // If the start and end months are the same, it's monthly
      else if (startDate.getMonth() === endDate.getMonth() && startDate.getFullYear() === endDate.getFullYear()) {
        return 'Bulan Ini';
      } 
      // If the start and end years are the same, it's yearly
      else if (startDate.getFullYear() === endDate.getFullYear()) {
        return 'Tahun Ini';
      } 
      else {
        // Custom date range
        const startStr = startDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
        const endStr = endDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
        return `${startStr} - ${endStr}`;
      }
    }
    // Default to Tahun Ini if no dates are available
    return 'Tahun Ini';
  }
</script>

<!-- Top Selling Products Section -->
{#if reportData.topSellingProducts && reportData.topSellingProducts.length > 0}
  <div class="mb-6">
    <h3 class="text-xl font-bold m-6 text-center">Produk Terlaris {getTimePeriodLabel()}</h3>
    <div class="overflow-x-auto">
      <table class="table table-zebra">
        <thead>
          <tr>
            <th>Nama Produk</th>
            <th>Kode Dasar</th>
            <th>Kategori</th>
            <th class="text-right">Jumlah Terjual</th>
            <th class="text-right">Total Pendapatan</th>
            <th class="text-right">Harga Rata-rata</th>
          </tr>
        </thead>
        <tbody>
          {#each reportData.topSellingProducts as product}
            <tr>
              <td>{product.name}</td>
              <td>{product.baseCode}</td>
              <td>
                <span class="badge badge-primary">
                  {capitalizeFirstLetter(product.category)}
                </span>
              </td>
              <td class="text-right">{product.totalSold}</td>
              <td class="text-right">{formatCurrency(product.totalRevenue)}</td>
              <td class="text-right">
                {formatCurrency(
                  product.totalSold > 0 
                    ? product.totalRevenue / product.totalSold 
                    : 0
                )}
              </td>
            </tr>
          {/each}
          <tr class="font-bold">
            <td colspan="3">Total</td>
            <td class="text-right"
              >{reportData.topSellingProducts.reduce(
                (sum, product) => sum + product.totalSold,
                0
              )}</td
            >
            <td class="text-right"
              >{formatCurrency(
                reportData.topSellingProducts.reduce(
                  (sum, product) => sum + product.totalRevenue,
                  0
                )
              )}</td
            >
            <td class="text-right"
              >{formatCurrency(
                reportData.topSellingProducts.length > 0
                  ? reportData.topSellingProducts.reduce(
                      (sum, product) => sum + (product.totalSold > 0 ? product.totalRevenue / product.totalSold : 0),
                      0
                    ) / reportData.topSellingProducts.length
                  : 0
              )}</td
            >
          </tr>
        </tbody>
      </table>
    </div>
  </div>
{/if}

<!-- Product Sales Details Section -->
<div>
  <h3 class="text-xl font-bold m-6 text-center">Rincian Penjualan Produk {getTimePeriodLabel()}</h3>
  {#if reportData.productSales && reportData.productSales.length > 0}
    <div class="overflow-x-auto">
      <table class="table table-zebra">
        <thead>
          <tr>
            <th>Nama Produk</th>
            <th>Kode Dasar</th>
            <th>Kategori</th>
            <th class="text-right">Jumlah Terjual</th>
            <th class="text-right">Total Pendapatan</th>
            <th>Rincian Pesanan</th>
          </tr>
        </thead>
        <tbody>
          {#each reportData.productSales as product}
            <tr>
              <td>{product.productName}</td>
              <td>{product.baseCode}</td>
              <td>
                <span class="badge badge-primary">
                  {capitalizeFirstLetter(product.category)}
                </span>
              </td>
              <td class="text-right">{product.totalSold}</td>
              <td class="text-right">{formatCurrency(product.totalRevenue)}</td>
              <td>
                {#if product.orders && product.orders.length > 0}
                  <details class="dropdown">
                    <summary class="btn btn-xs btn-outline">Lihat Pesanan ({product.orders.length})</summary>
                    <ul class="p-2 shadow menu dropdown-content z-[1] bg-base-100 rounded-box w-64 max-h-60 overflow-y-auto">
                      {#each product.orders as order}
                        <li role="menuitem">
                          <div>
                            <div class="flex justify-between">
                              <span>{order.orderNumber}</span>
                              <span>{formatCurrency(order.totalPrice)}</span>
                            </div>
                            <div class="text-xs opacity-75">
                              {order.customerName} - {formatDate(order.orderDate)}
                            </div>
                          </div>
                        </li>
                      {/each}
                    </ul>
                  </details>
                {:else}
                  <span class="text-xs opacity-75">Tidak ada pesanan</span>
                {/if}
              </td>
            </tr>
          {/each}
          <tr class="font-bold">
            <td colspan="3">Total</td>
            <td class="text-right"
              >{reportData.productSales.reduce(
                (sum, product) => sum + product.totalSold,
                0
              )}</td
            >
            <td class="text-right"
              >{formatCurrency(
                reportData.productSales.reduce(
                  (sum, product) => sum + product.totalRevenue,
                  0
                )
              )}</td
            >
            <td></td>
          </tr>
        </tbody>
      </table>
    </div>
  {:else}
    <div class="alert alert-info">
      <div>
        <span>Tidak ada penjualan produk dalam periode ini.</span>
      </div>
    </div>
  {/if}
</div>