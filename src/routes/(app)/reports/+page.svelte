<script lang="ts">
  import DefaultLayout from "$lib/layouts/DefaultLayout.svelte";
  import PageHeader from "$lib/components/PageHeader.svelte";
</script>

<DefaultLayout title="Reports">
  <PageHeader title="Laporan" icon="📊" />
  

  
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
    <a 
      href="/reports/daily" 
      class="block card bg-base-100 shadow-md hover:shadow-lg transition-shadow duration-300 p-4 border border-base-300 hover:border-primary"
    >
      <div class="flex items-start">
        <div class="bg-blue-500 text-white rounded-full w-12 h-12 flex items-center justify-center text-xl mr-4">
          📅
        </div>
        <div>
          <h3 class="font-semibold text-lg">Laporan Harian</h3>
          <p class="text-gray-600 text-sm mt-1">Laporan penjualan harian</p>
        </div>
      </div>
    </a>
    
    <a 
      href="/reports/weekly" 
      class="block card bg-base-100 shadow-md hover:shadow-lg transition-shadow duration-300 p-4 border border-base-300 hover:border-primary"
    >
      <div class="flex items-start">
        <div class="bg-green-500 text-white rounded-full w-12 h-12 flex items-center justify-center text-xl mr-4">
          🗓️
        </div>
        <div>
          <h3 class="font-semibold text-lg">Laporan Mingguan</h3>
          <p class="text-gray-600 text-sm mt-1">Laporan penjualan mingguan</p>
        </div>
      </div>
    </a>
    
    <a 
      href="/reports/monthly" 
      class="block card bg-base-100 shadow-md hover:shadow-lg transition-shadow duration-300 p-4 border border-base-300 hover:border-primary"
    >
      <div class="flex items-start">
        <div class="bg-purple-500 text-white rounded-full w-12 h-12 flex items-center justify-center text-xl mr-4">
          📆
        </div>
        <div>
          <h3 class="font-semibold text-lg">Laporan Bulanan</h3>
          <p class="text-gray-600 text-sm mt-1">Sedang dalam perbaikan...</p>
        </div>
      </div>
    </a>
    
    <a 
      href="/reports/annual" 
      class="block card bg-base-100 shadow-md hover:shadow-lg transition-shadow duration-300 p-4 border border-base-300 hover:border-primary"
    >
      <div class="flex items-start">
        <div class="bg-yellow-500 text-white rounded-full w-12 h-12 flex items-center justify-center text-xl mr-4">
          📆
        </div>
        <div>
          <h3 class="font-semibold text-lg">Laporan Tahunan</h3>
          <p class="text-gray-600 text-sm mt-1">Sedang dalam perbaikan...</p>
        </div>
      </div>
    </a>
    
    <a 
      href="/reports/product" 
      class="block card bg-base-100 shadow-md hover:shadow-lg transition-shadow duration-300 p-4 border border-base-300 hover:border-primary"
    >
      <div class="flex items-start">
        <div class="bg-red-500 text-white rounded-full w-12 h-12 flex items-center justify-center text-xl mr-4">
          📦
        </div>
        <div>
          <h3 class="font-semibold text-lg">Laporan Produk</h3>
          <p class="text-gray-600 text-sm mt-1">Sedang dalam perbaikan...</p>
        </div>
      </div>
    </a>
    
    <a 
      href="/reports/customer" 
      class="block card bg-base-100 shadow-md hover:shadow-lg transition-shadow duration-300 p-4 border border-base-300 hover:border-primary"
    >
      <div class="flex items-start">
        <div class="bg-indigo-500 text-white rounded-full w-12 h-12 flex items-center justify-center text-xl mr-4">
          👤
        </div>
        <div>
          <h3 class="font-semibold text-lg">Laporan Pelanggan</h3>
          <p class="text-gray-600 text-sm mt-1">Sedang dalam perbaikan...</p>
        </div>
      </div>
    </a>
    
    <a 
      href="/reports/revenue" 
      class="block card bg-base-100 shadow-md hover:shadow-lg transition-shadow duration-300 p-4 border border-base-300 hover:border-primary"
    >
      <div class="flex items-start">
        <div class="bg-teal-500 text-white rounded-full w-12 h-12 flex items-center justify-center text-xl mr-4">
          💰
        </div>
        <div>
          <h3 class="font-semibold text-lg">Laporan Pendapatan</h3>
          <p class="text-gray-600 text-sm mt-1">Laporan pendapatan harian</p>
        </div>
      </div>
    </a>
    
    <a 
      href="/reports/expense" 
      class="block card bg-base-100 shadow-md hover:shadow-lg transition-shadow duration-300 p-4 border border-base-300 hover:border-primary"
    >
      <div class="flex items-start">
        <div class="bg-orange-500 text-white rounded-full w-12 h-12 flex items-center justify-center text-xl mr-4">
          💸
        </div>
        <div>
          <h3 class="font-semibold text-lg">Laporan Pengeluaran</h3>
          <p class="text-gray-600 text-sm mt-1">Laporan pengeluaran harian</p>
        </div>
      </div>
    </a>
    
    <a 
      href="/reports/margin" 
      class="block card bg-base-100 shadow-md hover:shadow-lg transition-shadow duration-300 p-4 border border-base-300 hover:border-primary"
    >
      <div class="flex items-start">
        <div class="bg-cyan-500 text-white rounded-full w-12 h-12 flex items-center justify-center text-xl mr-4">
          📈
        </div>
        <div>
          <h3 class="font-semibold text-lg">Laporan Margin</h3>
          <p class="text-gray-600 text-sm mt-1">Laporan margin keuntungan</p>
        </div>
      </div>
    </a>
  </div>
</DefaultLayout>