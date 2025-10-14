<script lang="ts">
  import { formatCurrency, capitalizeFirstLetter } from "$lib/utils/formatters";
  import type { RevenueReportData } from "$lib/types";

  export let reportData: RevenueReportData | null | undefined;

  // Function to determine the time period based on date range
  function getTimePeriodLabel(): string {
    if (reportData && reportData.startDate && reportData.endDate) {
      const startDate = new Date(reportData.startDate);
      const endDate = new Date(reportData.endDate);

      // Calculate the difference in days
      const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      // If it's exactly 1 day, it's daily
      if (diffDays === 1) {
        return "Harian";
      }
      // If it's 7 days, it's weekly
      else if (diffDays === 7) {
        return "Minggu Ini";
      }
      // If the start and end months are the same, it's monthly
      else if (
        startDate.getMonth() === endDate.getMonth() &&
        startDate.getFullYear() === endDate.getFullYear()
      ) {
        return "Bulan Ini";
      }
      // If the start and end years are the same, it's yearly
      else if (startDate.getFullYear() === endDate.getFullYear()) {
        return "Tahun Ini";
      } else {
        // Custom date range
        const startStr = startDate.toLocaleDateString("id-ID", {
          day: "numeric",
          month: "short",
        });
        const endStr = endDate.toLocaleDateString("id-ID", {
          day: "numeric",
          month: "short",
          year: "numeric",
        });
        return `${startStr} - ${endStr}`;
      }
    }
    // Default to Tahun Ini if no dates are available
    return "Tahun Ini";
  }
</script>

{#if reportData}
  <!-- Top Revenue Products Section -->
  {#if reportData.topRevenueProducts && reportData.topRevenueProducts.length > 0}
    <div class="mb-6">
      <h3 class="text-xl font-bold m-6 text-center">
        Produk Pendapatan Tertinggi {getTimePeriodLabel()}
      </h3>
      <div class="overflow-x-auto">
        <table class="table table-zebra">
          <thead>
            <tr>
              <th>Nama Produk</th>
              <th class="text-right">Jumlah Terjual</th>
              <th class="text-right">Total Pendapatan</th>
            </tr>
          </thead>
          <tbody>
            {#each reportData.topRevenueProducts as product}
              <tr>
                <td>{product.name}</td>
                <td class="text-right">{product.totalSold}</td>
                <td class="text-right"
                  >{formatCurrency(product.totalRevenue)}</td
                >
              </tr>
            {/each}
            <tr class="font-bold">
              <td>Total</td>
              <td class="text-right">
                {reportData.topRevenueProducts.reduce(
                  (sum, product) => sum + product.totalSold,
                  0
                )}
              </td>
              <td class="text-right">
                {formatCurrency(
                  reportData.topRevenueProducts.reduce(
                    (sum, product) => sum + product.totalRevenue,
                    0
                  )
                )}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  {/if}

  <!-- Orders Details Section -->
  <div>
    <h3 class="text-xl font-bold m-6 text-center">
      Rincian Pesanan {getTimePeriodLabel()}
    </h3>
    {#if reportData.orders && reportData.orders.length > 0}
      <div class="overflow-x-auto">
        <table class="table table-zebra">
          <thead>
            <tr>
              <th>Tanggal</th>
              <th>No. Pesanan</th>
              <th>Nama Kasir</th>
              <th>Status</th>
              <th>Metode Pembayaran</th>
              <th class="text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {#each reportData.orders as order}
              <tr>
                <td
                  >{new Date(order.createdAt).toLocaleDateString("id-ID", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}</td
                >
                <td>{order.orderNumber}</td>
                <td>{order.user.name}</td>
                <td>
                  <span
                    class="badge {order.status === 'finished'
                      ? 'badge-success'
                      : order.status === 'processing'
                        ? 'badge-warning'
                        : order.status === 'pending'
                          ? 'badge-info'
                          : 'badge-error'}"
                  >
                    {order.status === "finished"
                      ? "Selesai"
                      : order.status === "processing"
                        ? "Diproses"
                        : order.status === "pending"
                          ? "Pending"
                          : "Dibatalkan"}
                  </span>
                </td>
                <td>
                  <span class="badge badge-primary">
                    {order.paymentMethod === "transfer"
                      ? "Transfer"
                      : order.paymentMethod === "qris"
                        ? "QRIS"
                        : "Tunai"}
                  </span>
                </td>
                <td class="text-right">{formatCurrency(order.totalAmount)}</td>
              </tr>
            {/each}
            <tr class="font-bold">
              <td colspan="5" class="text-right">Total</td>
              <td class="text-right">
                {formatCurrency(
                  reportData.orders.reduce(
                    (sum, order) => sum + order.totalAmount,
                    0
                  )
                )}
              </td>
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
