<script lang="ts">
  import {
    formatCurrency,
    formatDate,
    getStatusClass,
    getStatusDisplayText,
  } from "$lib/utils/formatters";
  import type { CustomerReportData } from "$lib/types";

  export let reportData: CustomerReportData;
</script>

<!-- Top Customers Section -->
{#if reportData.topCustomers && reportData.topCustomers.length > 0}
  <div class="mb-6">
    <h3 class="text-xl font-bold m-6 text-center">Pelanggan Terbaik</h3>
    <div class="overflow-x-auto">
      <table class="table table-zebra">
        <thead>
          <tr>
            <th>Nama Pelanggan</th>
            <th>No. Telepon</th>
            <th class="text-right">Total Pesanan</th>
            <th class="text-right">Total Pengeluaran</th>
            <th class="text-right">Rata-rata Nilai Pesanan</th>
          </tr>
        </thead>
        <tbody>
          {#each reportData.topCustomers as customer}
            <tr>
              <td>{customer.name}</td>
              <td>{customer.phone}</td>
              <td class="text-right">{customer.totalOrders}</td>
              <td class="text-right">{formatCurrency(customer.totalSpent)}</td>
              <td class="text-right">{formatCurrency(customer.averageOrderValue)}</td>
            </tr>
          {/each}
          <tr class="font-bold">
            <td colspan="2">Total</td>
            <td class="text-right"
              >{reportData.topCustomers.reduce(
                (sum, customer) => sum + customer.totalOrders,
                0
              )}</td
            >
            <td class="text-right"
              >{formatCurrency(
                reportData.topCustomers.reduce(
                  (sum, customer) => sum + customer.totalSpent,
                  0
                )
              )}</td
            >
            <td class="text-right"
              >{formatCurrency(
                reportData.topCustomers.length > 0
                  ? reportData.topCustomers.reduce(
                      (sum, customer) => sum + customer.averageOrderValue,
                      0
                    ) / reportData.topCustomers.length
                  : 0
              )}</td
            >
          </tr>
        </tbody>
      </table>
    </div>
  </div>
{/if}

<!-- Customer Orders Details Section -->
<div>
  <h3 class="text-xl font-bold m-6 text-center">Rincian Pesanan Pelanggan</h3>
  {#if reportData.customerOrders && reportData.customerOrders.length > 0}
    <div class="overflow-x-auto">
      <table class="table table-zebra">
        <thead>
          <tr>
            <th>Waktu</th>
            <th>No. Order</th>
            <th>Nama Pelanggan</th>
            <th>No. Telepon</th>
            <th>Status</th>
            <th class="text-right">Total</th>
          </tr>
        </thead>
        <tbody>
          {#each reportData.customerOrders as order}
            <tr>
              <td>{formatDate(order.createdAt)}</td>
              <td>{order.orderNumber}</td>
              <td>{order.customerName}</td>
              <td>{order.customerPhone}</td>
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
            <td></td>
            <td class="text-right">Total</td>
            <td class="text-right"
              >{formatCurrency(
                reportData.customerOrders.reduce(
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
        <span>Tidak ada pesanan pelanggan dalam periode ini.</span>
      </div>
    </div>
  {/if}
</div>