<script lang="ts">
  import { formatCurrency } from '$lib/utils/formatters';
  import type { CustomerReportData } from '$lib/types';
  
  export let reportData: CustomerReportData;
</script>

<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
  <!-- Total Customers Card -->
  <div class="card bg-base-100 shadow-md border border-base-200">
    <div class="card-body">
      <h3 class="card-title text-sm opacity-75">Total Pelanggan</h3>
      <p class="text-3xl font-bold">{reportData.totalCustomers}</p>
      <div class="text-xs opacity-75">pelanggan</div>
    </div>
  </div>
  
  <!-- Total Orders Card -->
  <div class="card bg-base-100 shadow-md border border-base-200">
    <div class="card-body">
      <h3 class="card-title text-sm opacity-75">Total Pesanan</h3>
      <p class="text-3xl font-bold">{reportData.totalOrders}</p>
      <div class="text-xs opacity-75">pesanan</div>
    </div>
  </div>
  
  <!-- Total Revenue Card -->
  <div class="card bg-base-100 shadow-md border border-base-200">
    <div class="card-body">
      <h3 class="card-title text-sm opacity-75">Total Pendapatan</h3>
      <p class="text-3xl font-bold text-success">{formatCurrency(reportData.totalRevenue)}</p>
      <div class="text-xs opacity-75">pendapatan</div>
    </div>
  </div>
  
  <!-- Average Order Value Card -->
  <div class="card bg-base-100 shadow-md border border-base-200">
    <div class="card-body">
      <h3 class="card-title text-sm opacity-75">Rata-rata Nilai Pesanan</h3>
      <p class="text-3xl font-bold text-info">{formatCurrency(reportData.averageOrderValue)}</p>
      <div class="text-xs opacity-75">per pesanan</div>
    </div>
  </div>
</div>