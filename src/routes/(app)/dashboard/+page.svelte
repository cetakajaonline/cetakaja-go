<script lang="ts">
  export let data;
  const { user, items, users, tokens } = data;

  const totalItem = items.length;
  const totalUser = users.length;
  const totalToken = tokens.length;
  const latestItems = [...items].slice(0, 5);
</script>

<div class="p-6">
  <!-- Greeting -->
  <div class="text-center mb-8">
    <h1 class="text-2xl md:text-3xl font-bold">👋 Halo, {user.name}</h1>
    <p class="text-sm text-gray-500 mt-1">Selamat datang di dashboard</p>
  </div>

  <!-- Statistik Cards -->
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
    <div class="bg-base-100 shadow-md rounded-2xl p-5 flex items-center space-x-4 border border-base-200">
      <div class="text-3xl">📦</div>
      <div>
        <div class="text-lg font-semibold">{totalItem}</div>
        <div class="text-sm text-gray-500">Total Item</div>
      </div>
    </div>

    <div class="bg-base-100 shadow-md rounded-2xl p-5 flex items-center space-x-4 border border-base-200">
      <div class="text-3xl">👥</div>
      <div>
        <div class="text-lg font-semibold">{totalUser}</div>
        <div class="text-sm text-gray-500">Total Pengguna</div>
      </div>
    </div>

    <div class="bg-base-100 shadow-md rounded-2xl p-5 flex items-center space-x-4 border border-base-200">
      <div class="text-3xl">🔑</div>
      <div>
        <div class="text-lg font-semibold">{totalToken}</div>
        <div class="text-sm text-gray-500">Total API Token</div>
      </div>
    </div>
  </div>

  <!-- Item Terbaru -->
  <div class="bg-base-100 p-6 rounded-2xl shadow-md border border-base-200">
    <h2 class="text-lg font-bold mb-4">📋 5 Item Terbaru</h2>
    <ul class="divide-y divide-base-300">
      {#each latestItems as item}
        <li class="py-3">
          <div class="flex justify-between items-center">
            <div>
              <div class="font-medium">{item.name}</div>
              <div class="text-sm text-gray-500">{item.desc}</div>
            </div>
            <div class="text-xs text-gray-400">
              {new Date(item.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} •
              {new Date(item.createdAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
            </div>
          </div>
        </li>
      {/each}
    </ul>
  </div>
</div>
