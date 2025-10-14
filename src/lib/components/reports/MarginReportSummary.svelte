<script lang="ts">
  import type { MarginReportData } from "$lib/types";

  export let reportData: MarginReportData;
</script>

<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
  <!-- Total Revenue -->
  <div class="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-xl shadow">
    <div class="text-sm font-semibold">Total Pendapatan</div>
    <div class="text-2xl font-bold mt-2">
      Rp {reportData.totalRevenue?.toLocaleString("id-ID") || 0}
    </div>
    <div class="mt-4 flex items-center text-sm">
      <span class="flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
        </svg>
        Pendapatan
      </span>
    </div>
  </div>

  <!-- Total Cost -->
  <div class="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6 rounded-xl shadow">
    <div class="text-sm font-semibold">Total Biaya</div>
    <div class="text-2xl font-bold mt-2">
      Rp {reportData.totalCost?.toLocaleString("id-ID") || 0}
    </div>
    <div class="mt-4 flex items-center text-sm">
      <span class="flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
        </svg>
        Biaya
      </span>
    </div>
  </div>

  <!-- Total Profit -->
  <div class="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-xl shadow">
    <div class="text-sm font-semibold">Total Laba</div>
    <div class="text-2xl font-bold mt-2">
      Rp {reportData.totalProfit?.toLocaleString("id-ID") || 0}
    </div>
    <div class="mt-4 flex items-center text-sm">
      <span class="flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 11l3-3m0 0l3 3m-3-3v8m0-13a9 9 0 110 18 9 9 0 010-18z" />
        </svg>
        Laba
      </span>
    </div>
  </div>

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
</div>

<!-- Margin Percentages -->
<div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
  <div class="bg-white p-6 rounded-lg shadow border text-center">
    <div class="text-3xl font-bold text-blue-600">{reportData.grossMargin?.toFixed(2) || 0}%</div>
    <div class="text-sm text-gray-600">Gross Margin</div>
  </div>
  
  <div class="bg-white p-6 rounded-lg shadow border text-center">
    <div class="text-3xl font-bold text-green-600">{reportData.netMargin?.toFixed(2) || 0}%</div>
    <div class="text-sm text-gray-600">Net Margin</div>
  </div>
</div>

<!-- Orders by Status -->
<div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
  <div class="bg-white p-4 rounded-lg shadow border text-center">
    <div class="text-lg font-bold text-blue-600">{reportData.ordersByStatus?.pending || 0}</div>
    <div class="text-sm text-gray-600">Pending</div>
  </div>
  
  <div class="bg-white p-4 rounded-lg shadow border text-center">
    <div class="text-lg font-bold text-yellow-600">{reportData.ordersByStatus?.processing || 0}</div>
    <div class="text-sm text-gray-600">Diproses</div>
  </div>
  
  <div class="bg-white p-4 rounded-lg shadow border text-center">
    <div class="text-lg font-bold text-green-600">{reportData.ordersByStatus?.finished || 0}</div>
    <div class="text-sm text-gray-600">Selesai</div>
  </div>
  
  <div class="bg-white p-4 rounded-lg shadow border text-center">
    <div class="text-lg font-bold text-red-600">{reportData.ordersByStatus?.canceled || 0}</div>
    <div class="text-sm text-gray-600">Dibatalkan</div>
  </div>
</div>