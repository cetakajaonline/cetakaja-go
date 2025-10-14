<script lang="ts">
  import { formatCurrency } from "$lib/utils/formatters";
  import type { ExpenseReportData } from "$lib/types";

  export let reportData: ExpenseReportData | null | undefined;
</script>

{#if reportData}
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
    <!-- Total Expenses Card -->
    <div class="card bg-base-100 shadow-md border border-base-200">
      <div class="card-body">
        <h3 class="card-title text-sm opacity-75">Total Pengeluaran</h3>
        <p class="text-3xl font-bold text-error">{formatCurrency(reportData.totalExpenses)}</p>
        <div class="text-xs opacity-75">pengeluaran</div>
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

    <!-- Net Revenue Card -->
    <div class="card bg-base-100 shadow-md border border-base-200">
      <div class="card-body">
        <h3 class="card-title text-sm opacity-75">Pendapatan Bersih</h3>
        <p class="text-3xl font-bold text-info">{formatCurrency(reportData.totalRevenue - reportData.totalExpenses)}</p>
        <div class="text-xs opacity-75">bersih</div>
      </div>
    </div>
  </div>

  <!-- Expenses by Category -->
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
    <div class="card bg-base-100 shadow-md border border-base-200">
      <div class="card-body">
        <h3 class="card-title text-sm opacity-75">Operasional</h3>
        <p class="text-2xl font-bold">{formatCurrency(reportData.expenseCategories?.operational || 0)}</p>
        <div class="text-xs opacity-75">pengeluaran</div>
      </div>
    </div>
    
    <div class="card bg-base-100 shadow-md border border-base-200">
      <div class="card-body">
        <h3 class="card-title text-sm opacity-75">Marketing</h3>
        <p class="text-2xl font-bold">{formatCurrency(reportData.expenseCategories?.marketing || 0)}</p>
        <div class="text-xs opacity-75">pengeluaran</div>
      </div>
    </div>
    
    <div class="card bg-base-100 shadow-md border border-base-200">
      <div class="card-body">
        <h3 class="card-title text-sm opacity-75">Gaji</h3>
        <p class="text-2xl font-bold">{formatCurrency(reportData.expenseCategories?.gaji || 0)}</p>
        <div class="text-xs opacity-75">pengeluaran</div>
      </div>
    </div>
    
    <div class="card bg-base-100 shadow-md border border-base-200">
      <div class="card-body">
        <h3 class="card-title text-sm opacity-75">Lainnya</h3>
        <p class="text-2xl font-bold">{formatCurrency(reportData.expenseCategories?.lainnya || 0)}</p>
        <div class="text-xs opacity-75">pengeluaran</div>
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