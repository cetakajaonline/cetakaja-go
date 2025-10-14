<script lang="ts">
  import type { ExpenseReportData } from "$lib/types";

  export let reportData: ExpenseReportData | null | undefined;
</script>

{#if reportData}
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
    <!-- Total Expenses -->
    <div class="bg-gradient-to-r from-red-500 to-red-600 text-white p-6 rounded-xl shadow">
      <div class="text-sm font-semibold">Total Pengeluaran</div>
      <div class="text-2xl font-bold mt-2">
        Rp {reportData.totalExpenses?.toLocaleString("id-ID") || 0}
      </div>
      <div class="mt-4 flex items-center text-sm">
        <span class="flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
          </svg>
          Pengeluaran
        </span>
      </div>
    </div>

    <!-- Total Orders -->
    <div class="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-xl shadow">
      <div class="text-sm font-semibold">Total Pesanan</div>
      <div class="text-2xl font-bold mt-2">{reportData.totalOrders}</div>
      <div class="mt-4 flex items-center text-sm">
        <span class="flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
          Pesanan
        </span>
      </div>
    </div>

    <!-- Total Revenue -->
    <div class="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-xl shadow">
      <div class="text-sm font-semibold">Total Pendapatan</div>
      <div class="text-2xl font-bold mt-2">
        Rp {reportData.totalRevenue?.toLocaleString("id-ID") || 0}
      </div>
      <div class="mt-4 flex items-center text-sm">
        <span class="flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599-1" />
          </svg>
          Pendapatan
        </span>
      </div>
    </div>
  </div>

  <!-- Expenses by Category -->
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
    <div class="bg-white p-4 rounded-lg shadow border">
      <div class="text-sm font-semibold text-gray-700 mb-2">Operasional</div>
      <div class="text-xl font-bold text-blue-600">
        Rp {reportData.expenseCategories?.operational?.toLocaleString("id-ID") || 0}
      </div>
    </div>
    
    <div class="bg-white p-4 rounded-lg shadow border">
      <div class="text-sm font-semibold text-gray-700 mb-2">Marketing</div>
      <div class="text-xl font-bold text-green-600">
        Rp {reportData.expenseCategories?.marketing?.toLocaleString("id-ID") || 0}
      </div>
    </div>
    
    <div class="bg-white p-4 rounded-lg shadow border">
      <div class="text-sm font-semibold text-gray-700 mb-2">Gaji</div>
      <div class="text-xl font-bold text-yellow-600">
        Rp {reportData.expenseCategories?.gaji?.toLocaleString("id-ID") || 0}
      </div>
    </div>
    
    <div class="bg-white p-4 rounded-lg shadow border">
      <div class="text-sm font-semibold text-gray-700 mb-2">Lainnya</div>
      <div class="text-xl font-bold text-purple-600">
        Rp {reportData.expenseCategories?.lainnya?.toLocaleString("id-ID") || 0}
      </div>
    </div>
  </div>
{:else}
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
    <!-- Loading placeholders for the summary cards -->
    <div class="bg-gray-200 p-6 rounded-xl shadow animate-pulse">
      <div class="h-4 bg-gray-400 rounded w-3/4 mb-4"></div>
      <div class="h-8 bg-gray-400 rounded w-full mb-4"></div>
      <div class="h-4 bg-gray-400 rounded w-1/2"></div>
    </div>
    
    <div class="bg-gray-200 p-6 rounded-xl shadow animate-pulse">
      <div class="h-4 bg-gray-400 rounded w-3/4 mb-4"></div>
      <div class="h-8 bg-gray-400 rounded w-full mb-4"></div>
      <div class="h-4 bg-gray-400 rounded w-1/2"></div>
    </div>
    
    <div class="bg-gray-200 p-6 rounded-xl shadow animate-pulse">
      <div class="h-4 bg-gray-400 rounded w-3/4 mb-4"></div>
      <div class="h-8 bg-gray-400 rounded w-full mb-4"></div>
      <div class="h-4 bg-gray-400 rounded w-1/2"></div>
    </div>
    
    <div class="bg-gray-200 p-6 rounded-xl shadow animate-pulse">
      <div class="h-4 bg-gray-400 rounded w-3/4 mb-4"></div>
      <div class="h-8 bg-gray-400 rounded w-full mb-4"></div>
      <div class="h-4 bg-gray-400 rounded w-1/2"></div>
    </div>
  </div>
{/if}