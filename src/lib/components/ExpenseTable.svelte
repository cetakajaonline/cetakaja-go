<script lang="ts">
  import type { Expense } from "$lib/types";
  import { formatCurrency, capitalizeFirstLetter } from '$lib/utils/formatters';
  import { formatDateTime } from '$lib/utils/date';

  let { 
    expenses, 
    isAdmin, 
    isStaff, 
    onEdit, 
    onDelete, 
    onDetail,
    onSort, 
    sortKey, 
    sortDirection 
  }: { 
    expenses: Expense[];
    isAdmin: boolean;
    isStaff: boolean;
    onEdit: (expense: Expense) => void;
    onDelete: (expense: Expense) => void;
    onDetail: (expense: Expense) => void;
    onSort: (key: keyof Expense) => void;
    sortKey: keyof Expense;
    sortDirection: "asc" | "desc";
  } = $props();

  function formatCategory(category: string): string {
    const categoryMap: Record<string, string> = {
      operasional: "Operasional",
      marketing: "Marketing",
      gaji: "Gaji",
      lainnya: "Lainnya"
    };
    return categoryMap[category] || category;
  }
</script>

<div class="bg-base-100 rounded-lg shadow">
  <!-- Mobile Card Layout -->
  <div class="block sm:hidden">
    {#if expenses.length > 0}
      {#each expenses as expense (expense.id)}
        <div class="p-4">
          <div class="font-bold text-lg mb-2">{formatDateTime(expense.date)}</div>
          
          <div class="space-y-2 mb-4">
            <div class="flex">
              <div class="w-2/5 font-semibold">Kategori:</div>
              <div class="w-3/5 text-right">
                <span class={`badge ${expense.category === 'operasional' ? 'badge-primary' : expense.category === 'marketing' ? 'badge-info' : expense.category === 'gaji' ? 'badge-warning' : 'badge-neutral'}`}>
                  {formatCategory(expense.category)}
                </span>
              </div>
            </div>
            
            <div class="flex">
              <div class="w-2/5 font-semibold">Nominal:</div>
              <div class="w-3/5 text-right">
                {formatCurrency(expense.nominal)}
              </div>
            </div>
            
            <div class="flex">
              <div class="w-2/5 font-semibold">Deskripsi:</div>
              <div class="w-3/5 text-right">
                {expense.description || "-"}
              </div>
            </div>
            
            <div class="flex">
              <div class="w-2/5 font-semibold">Bukti:</div>
              <div class="w-3/5 text-right">
                {#if expense.proofFile}
                  <a href="{expense.proofFile}" target="_blank" class="text-blue-500 hover:underline">Lihat</a>
                {:else}
                  -
                {/if}
              </div>
            </div>
          </div>
          
          <!-- Actions at the bottom -->
          <div class="flex mt-4">
            <div class="join w-full">
              <button 
                class="btn btn-sm btn-outline btn-info join-item flex-1"
                onclick={() => onDetail(expense)}
              >
                Detail
              </button>
              {#if isAdmin || isStaff}
                <button 
                  class="btn btn-sm btn-outline btn-warning join-item flex-1"
                  onclick={() => onEdit(expense)}
                >
                  Edit
                </button>
                <button 
                  class="btn btn-sm btn-outline btn-error join-item flex-1"
                  onclick={() => onDelete(expense)}
                >
                  Hapus
                </button>
              {/if}
            </div>
          </div>
        </div>
      {/each}
    {:else}
      <div class="text-center py-8">
        <div class="text-lg">Tidak ada pengeluaran ditemukan</div>
      </div>
    {/if}
  </div>
  
  <!-- Desktop Table Layout -->
  <div class="hidden sm:block overflow-x-auto max-w-full">
    <table class="table table-zebra">
      <thead>
        <tr>
          <th onclick={() => onSort('date')}>
            <div class="flex items-center gap-2">
              <span>Tanggal</span>
              {#if sortKey === 'date'}
                {#if sortDirection === 'asc'} ↑ {:else} ↓ {/if}
              {/if}
            </div>
          </th>
          <th onclick={() => onSort('category')}>
            <div class="flex items-center gap-2">
              <span>Kategori</span>
              {#if sortKey === 'category'}
                {#if sortDirection === 'asc'} ↑ {:else} ↓ {/if}
              {/if}
            </div>
          </th>
          <th onclick={() => onSort('nominal')}>
            <div class="flex items-center gap-2">
              <span>Nominal</span>
              {#if sortKey === 'nominal'}
                {#if sortDirection === 'asc'} ↑ {:else} ↓ {/if}
              {/if}
            </div>
          </th>
          <th>Deskripsi</th>
          <th>Bukti</th>
          <th class="text-right">Aksi</th>
        </tr>
      </thead>
      <tbody>
        {#if expenses.length > 0}
          {#each expenses as expense (expense.id)}
            <tr class="hover">
              <td>
                <div class="font-medium">{formatDateTime(expense.date)}</div>
                <div class="text-sm opacity-70">{formatDate(expense.date)}</div>
              </td>
              <td>
                <span class={`badge ${expense.category === 'operasional' ? 'badge-primary' : expense.category === 'marketing' ? 'badge-info' : expense.category === 'gaji' ? 'badge-warning' : 'badge-neutral'}`}>
                  {formatCategory(expense.category)}
                </span>
              </td>
              <td>
                {formatCurrency(expense.nominal)}
              </td>
              <td>
                {expense.description || "-"}
              </td>
              <td>
                {#if expense.proofFile}
                  <a href="{expense.proofFile}" target="_blank" class="text-blue-500 hover:underline">Lihat</a>
                {:else}
                  -
                {/if}
              </td>
              <td class="text-right">
                <div class="join">
                  <button 
                    class="btn btn-xs btn-outline btn-info join-item"
                    onclick={() => onDetail(expense)}
                  >
                    Detail
                  </button>
                  {#if isAdmin || isStaff}
                    <button 
                      class="btn btn-xs btn-outline btn-warning join-item"
                      onclick={() => onEdit(expense)}
                    >
                      Edit
                    </button>
                    <button 
                      class="btn btn-xs btn-outline btn-error join-item"
                      onclick={() => onDelete(expense)}
                    >
                      Hapus
                    </button>
                  {/if}
                </div>
              </td>
            </tr>
          {/each}
        {:else}
          <tr>
            <td colspan="6" class="text-center py-8">
              <div class="text-center">
                <div class="text-lg">Tidak ada pengeluaran ditemukan</div>
              </div>
            </td>
          </tr>
        {/if}
      </tbody>
    </table>
  </div>
</div>