<script lang="ts">
  import { formatCurrency } from '$lib/utils/formatters';
  import type { ProductReportData } from '$lib/types';
  
  export let reportData: ProductReportData;
</script>

<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
  <!-- Total Products Card -->
  <div class="card bg-base-100 shadow-md border border-base-200">
    <div class="card-body">
      <h3 class="card-title text-sm opacity-75">Total Produk</h3>
      <p class="text-3xl font-bold">{reportData.totalProducts}</p>
      <div class="text-xs opacity-75">produk</div>
    </div>
  </div>
  
  <!-- Total Sold Card -->
  <div class="card bg-base-100 shadow-md border border-base-200">
    <div class="card-body">
      <h3 class="card-title text-sm opacity-75">Total Terjual</h3>
      <p class="text-3xl font-bold">{reportData.totalSold}</p>
      <div class="text-xs opacity-75">unit</div>
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
  
  <!-- Average Price Card -->
  <div class="card bg-base-100 shadow-md border border-base-200">
    <div class="card-body">
      <h3 class="card-title text-sm opacity-75">Harga Rata-rata</h3>
      <p class="text-3xl font-bold text-info">
        {formatCurrency(
          reportData.totalSold > 0 
            ? reportData.totalRevenue / reportData.totalSold 
            : 0
        )}
      </p>
      <div class="text-xs opacity-75">per unit</div>
    </div>
  </div>
</div>