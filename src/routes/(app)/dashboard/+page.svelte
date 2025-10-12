<script lang="ts">
  import DefaultLayout from "$lib/layouts/DefaultLayout.svelte";
  import PageHeader from "$lib/components/PageHeader.svelte";
  import type { DashboardPageData } from "$lib/types";

  export let data: DashboardPageData;
  const { user, users, orders, stats, products } = data;

  // Format currency for Indonesian Rupiah
  function formatCurrency(amount: number): string {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  }

  // Format date
  function formatDate(date: Date | string): string {
    return new Date(date).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  // Calculate progress percentage
  function getProgressPercentage(value: number, total: number): number {
    return total > 0 ? Math.min(100, Math.round((value / total) * 100)) : 0;
  }
</script>

<DefaultLayout title="Dashboard">
  <PageHeader title="Dashboard" icon="📊" />

  <div class="mx-auto space-y-6">
    <!-- Main Statistics Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <!-- Total Orders -->
      <div class="bg-base-300 shadow-md rounded-2xl p-5 border border-base-200">
        <div class="flex items-center justify-between">
          <div>
            <div class="text-2xl font-bold text-primary">
              {stats.totalOrders}
            </div>
            <div class="text-sm text-gray-500">Total Pesanan</div>
          </div>
          <div class="text-3xl">📦</div>
        </div>
        <div class="mt-3">
          <div class="flex justify-between text-xs text-gray-500 mb-1">
            <span>Selesai</span>
            <span>{stats.finishedOrders}</span>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-2">
            <div
              class="bg-success h-2 rounded-full"
              style="width: {getProgressPercentage(
                stats.finishedOrders,
                stats.totalOrders
              )}%"
            ></div>
          </div>
        </div>
      </div>

      <!-- Total Revenue -->
      <div class="bg-base-300 shadow-md rounded-2xl p-5 border border-base-200">
        <div class="flex items-center justify-between">
          <div>
            <div class="text-2xl font-bold text-success">
              {formatCurrency(stats.totalRevenue)}
            </div>
            <div class="text-sm text-gray-500">Total Pendapatan</div>
          </div>
          <div class="text-3xl">💰</div>
        </div>
        <div class="mt-3">
          <div class="flex justify-between text-xs text-gray-500 mb-1">
            <span>Bersih</span>
            <span>{formatCurrency(stats.netRevenue)}</span>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-2">
            <div class="bg-success h-2 rounded-full" style="width: 100%"></div>
          </div>
        </div>
      </div>

      <!-- Pending Orders -->
      <div class="bg-base-300 shadow-md rounded-2xl p-5 border border-base-200">
        <div class="flex items-center justify-between">
          <div>
            <div class="text-2xl font-bold text-warning">
              {stats.pendingOrders}
            </div>
            <div class="text-sm text-gray-500">Pesanan Menunggu</div>
          </div>
          <div class="text-3xl">⏳</div>
        </div>
        <div class="mt-3">
          <div class="flex justify-between text-xs text-gray-500 mb-1">
            <span>Proses</span>
            <span>{stats.processingOrders}</span>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-2">
            <div
              class="bg-warning h-2 rounded-full"
              style="width: {getProgressPercentage(
                stats.processingOrders,
                stats.totalOrders
              )}%"
            ></div>
          </div>
        </div>
      </div>

      <!-- Total Users -->
      <div class="bg-base-300 shadow-md rounded-2xl p-5 border border-base-200">
        <div class="flex items-center justify-between">
          <div>
            <div class="text-2xl font-bold text-info">{stats.totalUsers}</div>
            <div class="text-sm text-gray-500">Total Pengguna</div>
          </div>
          <div class="text-3xl">👥</div>
        </div>
        <div class="mt-3">
          <div class="flex justify-between text-xs text-gray-500 mb-1">
            <span>Klien Aktif</span>
            <span>{stats.totalOrders > 0 ? stats.totalUsers : 0}</span>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-2">
            <div class="bg-info h-2 rounded-full" style="width: 100%"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Charts and Graphs -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Orders by Status -->
      {#if user.role === "admin" || user.role === "staff"}
        <div
          class="bg-base-300 shadow-md rounded-2xl p-5 border border-base-200"
        >
          <h3 class="font-semibold mb-4">Status Pesanan</h3>
          <div class="space-y-3">
            <div>
              <div class="flex justify-between text-sm mb-1">
                <span class="flex items-center"
                  ><span class="w-3 h-3 bg-success rounded-full mr-2"></span> Selesai</span
                >
                <span
                  >{stats.finishedOrders} ({getProgressPercentage(
                    stats.finishedOrders,
                    stats.totalOrders
                  )}%)</span
                >
              </div>
              <div class="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  class="bg-success h-2.5 rounded-full"
                  style="width: {getProgressPercentage(
                    stats.finishedOrders,
                    stats.totalOrders
                  )}%"
                ></div>
              </div>
            </div>
            <div>
              <div class="flex justify-between text-sm mb-1">
                <span class="flex items-center"
                  ><span class="w-3 h-3 bg-warning rounded-full mr-2"></span> Proses</span
                >
                <span
                  >{stats.processingOrders} ({getProgressPercentage(
                    stats.processingOrders,
                    stats.totalOrders
                  )}%)</span
                >
              </div>
              <div class="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  class="bg-warning h-2.5 rounded-full"
                  style="width: {getProgressPercentage(
                    stats.processingOrders,
                    stats.totalOrders
                  )}%"
                ></div>
              </div>
            </div>
            <div>
              <div class="flex justify-between text-sm mb-1">
                <span class="flex items-center"
                  ><span class="w-3 h-3 bg-info rounded-full mr-2"></span> Menunggu</span
                >
                <span
                  >{stats.pendingOrders} ({getProgressPercentage(
                    stats.pendingOrders,
                    stats.totalOrders
                  )}%)</span
                >
              </div>
              <div class="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  class="bg-info h-2.5 rounded-full"
                  style="width: {getProgressPercentage(
                    stats.pendingOrders,
                    stats.totalOrders
                  )}%"
                ></div>
              </div>
            </div>
            <div>
              <div class="flex justify-between text-sm mb-1">
                <span class="flex items-center"
                  ><span class="w-3 h-3 bg-error rounded-full mr-2"></span> Dibatalkan</span
                >
                <span
                  >{stats.canceledOrders} ({getProgressPercentage(
                    stats.canceledOrders,
                    stats.totalOrders
                  )}%)</span
                >
              </div>
              <div class="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  class="bg-error h-2.5 rounded-full"
                  style="width: {getProgressPercentage(
                    stats.canceledOrders,
                    stats.totalOrders
                  )}%"
                ></div>
              </div>
            </div>
          </div>
        </div>
      {/if}

      <!-- Monthly Revenue (for admin/staff only) -->
      {#if user.role === "admin" || user.role === "staff"}
        <div
          class="bg-base-300 shadow-md rounded-2xl p-5 border border-base-200"
        >
          <h3 class="font-semibold mb-4">
            Pendapatan Bulanan (6 Bulan Terakhir)
          </h3>
          <div class="space-y-2 max-h-48 overflow-y-auto">
            {#if stats.monthlyRevenue.length > 0}
              {#each stats.monthlyRevenue as revenue, i}
                <div class="flex items-center">
                  <div class="w-24 text-sm">{revenue.month}</div>
                  <div class="flex-1 ml-2">
                    <div class="w-full bg-gray-200 rounded-full h-4">
                      <div
                        class="bg-gradient-to-r from-primary to-secondary h-4 rounded-full flex items-center justify-end pr-2 text-white text-xs"
                        style="width: {Math.min(
                          100,
                          Math.max(
                            5,
                            (revenue.total /
                              Math.max(
                                ...stats.monthlyRevenue.map((r) => r.total)
                              )) *
                              100
                          )
                        )}%"
                      >
                        {formatCurrency(revenue.total)}
                      </div>
                    </div>
                  </div>
                </div>
              {/each}
            {:else}
              <div class="text-center py-4 text-gray-500">Tidak ada data</div>
            {/if}
          </div>
        </div>
      {/if}
    </div>

    <!-- Top Selling Products and Recent Orders -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Top Selling Products (for admin/staff only) -->
      {#if user.role === "admin" || user.role === "staff"}
        <div
          class="bg-base-300 shadow-md rounded-2xl p-5 border border-base-200"
        >
          <h3 class="font-semibold mb-4">Produk Terlaris</h3>
          <div class="space-y-3">
            {#if stats.topSellingProducts.length > 0}
              {#each stats.topSellingProducts as product, i}
                <div
                  class="flex justify-between items-center pb-2 border-b border-base-200"
                >
                  <div>
                    <div class="font-medium">{product.name}</div>
                    <div class="text-sm text-gray-500">
                      Terjual: {product.totalSold} | Pendapatan: {formatCurrency(
                        product.totalRevenue
                      )}
                    </div>
                  </div>
                  <div class="text-lg">#{i + 1}</div>
                </div>
              {/each}
            {:else}
              <div class="text-center py-4 text-gray-500">
                Tidak ada data produk terlaris
              </div>
            {/if}
          </div>
        </div>
      {/if}

      <!-- Recent Orders -->
      <div class="bg-base-300 shadow-md rounded-2xl p-5 border border-base-200">
        <h3 class="font-semibold mb-4">Pesanan Terbaru</h3>
        <div class="space-y-3 max-h-80 overflow-y-auto">
          {#if stats.recentOrders.length > 0}
            {#each stats.recentOrders as order, i}
              <div class="pb-3 border-b border-base-200 last:border-0">
                <div class="flex justify-between items-start">
                  <div>
                    <div class="font-medium">#{order.orderNumber}</div>
                    <div class="text-sm text-gray-500">
                      Klien: {order.user?.name || "N/A"}
                    </div>
                    <div class="text-sm text-gray-500">
                      {formatDate(order.createdAt)}
                    </div>
                  </div>
                  <div class="text-right">
                    <div class="font-semibold text-success">
                      {formatCurrency(order.totalAmount)}
                    </div>
                    <div
                      class={`text-xs px-2 py-1 rounded-full inline-block min-w-[60px] text-center ${
                        order.status === "pending"
                          ? "bg-warning text-warning-content"
                          : order.status === "processing"
                            ? "bg-info text-info-content"
                            : order.status === "finished"
                              ? "bg-success text-success-content"
                              : "bg-error text-error-content"
                      }`}
                    >
                      {order.status === "pending"
                        ? "Menunggu"
                        : order.status === "processing"
                          ? "Proses"
                          : order.status === "finished"
                            ? "Selesai"
                            : "Dibatalkan"}
                    </div>
                  </div>
                </div>
              </div>
            {/each}
          {:else}
            <div class="text-center py-4 text-gray-500">
              Tidak ada pesanan terbaru
            </div>
          {/if}
        </div>
      </div>
    </div>

    <!-- Additional Stats for Admin/Staff -->
    {#if user.role === "admin" || user.role === "staff"}
      <div class="bg-base-300 shadow-md rounded-2xl p-5 border border-base-200">
        <h3 class="font-semibold mb-4">Statistik Tambahan</h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="bg-base-200 p-4 rounded-lg">
            <div class="text-2xl font-bold text-error">
              {formatCurrency(stats.totalExpenses)}
            </div>
            <div class="text-sm text-gray-500">Total Pengeluaran</div>
          </div>
          <div class="bg-base-200 p-4 rounded-lg">
            <div class="text-2xl font-bold text-success">
              {formatCurrency(stats.netRevenue)}
            </div>
            <div class="text-sm text-gray-500">Laba Bersih</div>
          </div>
          <div class="bg-base-200 p-4 rounded-lg">
            <div class="text-2xl font-bold text-info">
              {stats.totalOrders > 0
                ? formatCurrency(stats.totalRevenue / stats.totalOrders)
                : formatCurrency(0)}
            </div>
            <div class="text-sm text-gray-500">Rata-rata per Pesanan</div>
          </div>
        </div>
      </div>
    {/if}
  </div>
</DefaultLayout>
