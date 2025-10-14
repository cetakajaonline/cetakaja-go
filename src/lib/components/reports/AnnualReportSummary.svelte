<script lang="ts">
  import { formatCurrency } from '$lib/utils/formatters';
  import type { AnnualReportData } from '$lib/types';
  
  export let reportData: AnnualReportData;
</script>

<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
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
      <div class="text-xs opacity-75">tahun ini</div>
    </div>
  </div>
  
  <!-- Total Expenses Card -->
  <div class="card bg-base-100 shadow-md border border-base-200">
    <div class="card-body">
      <h3 class="card-title text-sm opacity-75">Total Pengeluaran</h3>
      <p class="text-3xl font-bold text-error">{formatCurrency(reportData.totalExpenses)}</p>
      <div class="text-xs opacity-75">tahun ini</div>
    </div>
  </div>
  
  <!-- Profit Card -->
  <div class="card bg-base-100 shadow-md border border-base-200">
    <div class="card-body">
      <h3 class="card-title text-sm opacity-75">Keuntungan</h3>
      <p class="text-3xl font-bold {reportData.totalProfit >= 0 ? 'text-success' : 'text-error'}">
        {formatCurrency(reportData.totalProfit)}
      </p>
      <div class="text-xs opacity-75">pendapatan bersih</div>
    </div>
  </div>
</div>