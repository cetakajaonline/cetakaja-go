<script lang="ts">
  import {
    formatCurrency,
    formatDate,
    getStatusClass,
    getStatusDisplayText,
    capitalizeFirstLetter,
  } from "$lib/utils/formatters";
  import type { DailyReportData } from "$lib/types";

  export let reportData: DailyReportData;
</script>

<!-- Top Selling Products Section -->
{#if reportData.topSellingProducts && reportData.topSellingProducts.length > 0}
  <div class="mb-6">
    <h3 class="text-xl font-bold m-6 text-center">Produk Terlaris</h3>
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
          {#each reportData.topSellingProducts as product}
            <tr>
              <td>{product.name}</td>
              <td class="text-right">{product.totalSold}</td>
              <td class="text-right">{formatCurrency(product.totalRevenue)}</td>
            </tr>
          {/each}
          <tr class="font-bold">
            <td>Total</td>
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
          </tr>
        </tbody>
      </table>
    </div>
  </div>
{/if}

<!-- Orders Details Section -->
<div>
  <h3 class="text-xl font-bold m-6 text-center">Rincian Pendapatan</h3>
  {#if reportData.orders && reportData.orders.length > 0}
    <div class="overflow-x-auto">
      <table class="table table-zebra">
        <thead>
          <tr>
            <th>Waktu</th>
            <th>No. Order</th>
            <th>Pelanggan</th>
            <th>Status</th>
            <th class="text-right">Total</th>
          </tr>
        </thead>
        <tbody>
          {#each reportData.orders as order}
            <tr>
              <td>{formatDate(order.createdAt)}</td>
              <td>{order.orderNumber}</td>
              <td>{order.user.name}</td>
              <td>
                <span class="badge {getStatusClass(order.status)}">
                  {getStatusDisplayText(order.status)}
                </span>
              </td>
              <td class="text-right">{formatCurrency(order.totalAmount)}</td>
            </tr>
          {/each}
          <tr class="font-bold">
            <td></td>
            <td></td>
            <td></td>
            <td class="text-right">Total</td>
            <td class="text-right"
              >{formatCurrency(
                reportData.orders.reduce(
                  (sum, order) => sum + order.totalAmount,
                  0
                )
              )}</td
            >
          </tr>
        </tbody>
      </table>
    </div>
  {:else}
    <div class="alert alert-info">
      <div>
        <span>Tidak ada pesanan pada tanggal ini.</span>
      </div>
    </div>
  {/if}
</div>

<!-- Expenses Details Section -->
<div class="mt-6">
  <h3 class="text-xl font-bold m-6 text-center">Rincian Pengeluaran</h3>
  {#if reportData.expenses && reportData.expenses.length > 0}
    <div class="overflow-x-auto">
      <table class="table table-zebra">
        <thead>
          <tr>
            <th>Waktu</th>
            <th>Kategori</th>
            <th>Deskripsi</th>
            <th class="text-right">Nominal</th>
          </tr>
        </thead>
        <tbody>
          {#each reportData.expenses as expense}
            <tr>
              <td>{formatDate(expense.date)}</td>
              <td>
                <span class="badge badge-primary">{capitalizeFirstLetter(expense.category)}</span>
              </td>
              <td>{expense.description || "-"}</td>
              <td class="text-right">{formatCurrency(expense.nominal)}</td>
            </tr>
          {/each}
          <tr class="font-bold">
            <td></td>
            <td></td>
            <td class="text-right">Total</td>
            <td class="text-right"
              >{formatCurrency(
                reportData.expenses.reduce(
                  (sum, expense) => sum + expense.nominal,
                  0
                )
              )}</td
            >
          </tr>
        </tbody>
      </table>
    </div>
  {:else}
    <div class="alert alert-info">
      <div>
        <span>Tidak ada pengeluaran pada tanggal ini.</span>
      </div>
    </div>
  {/if}
</div>
