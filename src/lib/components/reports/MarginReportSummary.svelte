<script lang="ts">
  import { formatCurrency } from "$lib/utils/formatters";
  import type { MarginReportData } from "$lib/types";

  export let reportData: MarginReportData | null | undefined;
</script>

{#if reportData}
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
    <!-- Total Revenue Card -->
    <div class="card bg-base-100 shadow-md border border-base-200">
      <div class="card-body">
        <h3 class="card-title text-sm opacity-75">Total Pendapatan</h3>
        <p class="text-3xl font-bold text-success">{formatCurrency(reportData.totalRevenue)}</p>
        <div class="text-xs opacity-75">pendapatan</div>
      </div>
    </div>

    <!-- Total Cost Card -->
    <div class="card bg-base-100 shadow-md border border-base-200">
      <div class="card-body">
        <h3 class="card-title text-sm opacity-75">Total Biaya</h3>
        <p class="text-3xl font-bold text-error">{formatCurrency(reportData.totalCost)}</p>
        <div class="text-xs opacity-75">biaya</div>
      </div>
    </div>

    <!-- Total Profit Card -->
    <div class="card bg-base-100 shadow-md border border-base-200">
      <div class="card-body">
        <h3 class="card-title text-sm opacity-75">Total Laba</h3>
        <p class="text-3xl font-bold text-success">{formatCurrency(reportData.totalProfit)}</p>
        <div class="text-xs opacity-75">laba</div>
      </div>
    </div>

    <!-- Total Expenses Card -->
    <div class="card bg-base-100 shadow-md border border-base-200">
      <div class="card-body">
        <h3 class="card-title text-sm opacity-75">Total Pengeluaran</h3>
        <p class="text-3xl font-bold text-error">{formatCurrency(reportData.totalExpenses)}</p>
        <div class="text-xs opacity-75">pengeluaran</div>
      </div>
    </div>
  </div>

  <!-- Margin Percentages -->
  <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
    <div class="card bg-base-100 shadow-md border border-base-200 text-center">
      <div class="card-body">
        <h3 class="text-sm opacity-75">Gross Margin</h3>
        <p class="text-3xl font-bold text-info">{reportData.grossMargin?.toFixed(2) || 0}%</p>
        <div class="text-xs opacity-75">margin kotor</div>
      </div>
    </div>
    
    <div class="card bg-base-100 shadow-md border border-base-200 text-center">
      <div class="card-body">
        <h3 class="text-sm opacity-75">Net Margin</h3>
        <p class="text-3xl font-bold text-success">{reportData.netMargin?.toFixed(2) || 0}%</p>
        <div class="text-xs opacity-75">margin bersih</div>
      </div>
    </div>
  </div>

  <!-- Orders by Status -->
  <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
    <div class="card bg-base-100 shadow-md border border-base-200 text-center">
      <div class="card-body">
        <h3 class="text-sm opacity-75">Pending</h3>
        <p class="text-2xl font-bold">{reportData.ordersByStatus?.pending || 0}</p>
        <div class="text-xs opacity-75">pesanan</div>
      </div>
    </div>
    
    <div class="card bg-base-100 shadow-md border border-base-200 text-center">
      <div class="card-body">
        <h3 class="text-sm opacity-75">Diproses</h3>
        <p class="text-2xl font-bold">{reportData.ordersByStatus?.processing || 0}</p>
        <div class="text-xs opacity-75">pesanan</div>
      </div>
    </div>
    
    <div class="card bg-base-100 shadow-md border border-base-200 text-center">
      <div class="card-body">
        <h3 class="text-sm opacity-75">Selesai</h3>
        <p class="text-2xl font-bold">{reportData.ordersByStatus?.finished || 0}</p>
        <div class="text-xs opacity-75">pesanan</div>
      </div>
    </div>
    
    <div class="card bg-base-100 shadow-md border border-base-200 text-center">
      <div class="card-body">
        <h3 class="text-sm opacity-75 text-red-600">Dibatalkan</h3>
        <p class="text-2xl font-bold text-red-600">{reportData.ordersByStatus?.canceled || 0}</p>
        <div class="text-xs opacity-75">pesanan</div>
      </div>
    </div>
  </div>
{:else}
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
    <!-- Loading placeholders for the summary cards -->
    <div class="card bg-base-100 shadow-md border border-base-200 animate-pulse">
      <div class="card-body">
        <div class="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
        <div class="h-8 bg-gray-200 rounded w-full mb-2"></div>
        <div class="h-3 bg-gray-200 rounded w-1/2"></div>
      </div>
    </div>

    <div class="card bg-base-100 shadow-md border border-base-200 animate-pulse">
      <div class="card-body">
        <div class="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
        <div class="h-8 bg-gray-200 rounded w-full mb-2"></div>
        <div class="h-3 bg-gray-200 rounded w-1/2"></div>
      </div>
    </div>

    <div class="card bg-base-100 shadow-md border border-base-200 animate-pulse">
      <div class="card-body">
        <div class="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
        <div class="h-8 bg-gray-200 rounded w-full mb-2"></div>
        <div class="h-3 bg-gray-200 rounded w-1/2"></div>
      </div>
    </div>

    <div class="card bg-base-100 shadow-md border border-base-200 animate-pulse">
      <div class="card-body">
        <div class="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
        <div class="h-8 bg-gray-200 rounded w-full mb-2"></div>
        <div class="h-3 bg-gray-200 rounded w-1/2"></div>
      </div>
    </div>
  </div>
{/if}