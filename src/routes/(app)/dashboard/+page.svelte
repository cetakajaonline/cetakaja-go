<script lang="ts">
  import DefaultLayout from '$lib/layouts/DefaultLayout.svelte';

  export let data;
  const { user, users } = data;

  const totalUser = users.length;
</script>

<DefaultLayout title="Dashboard">
  <div class="p-6 max-w-6xl mx-auto space-y-10">
    <!-- Greeting -->
    <div class="text-center">
      <h1 class="text-2xl md:text-3xl font-bold">👋 Halo, {user.name}</h1>
      <p class="text-sm text-gray-500 mt-1">Selamat datang di dashboard</p>
    </div>

    <!-- Statistik Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
      <div class="bg-base-100 shadow-md rounded-2xl p-5 flex items-center space-x-4 border border-base-200">
        <div class="text-3xl">👥</div>
        <div>
          <div class="text-lg font-semibold">{totalUser}</div>
          <div class="text-sm text-gray-500">Total Pengguna</div>
        </div>
      </div>

      <div class="bg-base-100 shadow-md rounded-2xl p-5 flex items-center space-x-4 border border-base-200">
        <div class="text-3xl">📊</div>
        <div>
          <div class="text-lg font-semibold">-</div>
          <div class="text-sm text-gray-500">Statistik Penjualan</div>
        </div>
      </div>
    </div>
  </div>
</DefaultLayout>
