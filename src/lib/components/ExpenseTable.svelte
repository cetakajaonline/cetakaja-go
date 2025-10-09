<script lang="ts">
  import type { Expense } from "$lib/types";

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

  function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  }

  function formatDate(dateString: string | Date): string {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

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

<div class="overflow-x-auto bg-base-100 rounded-lg shadow">
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
              <div class="font-medium">{formatDate(expense.date)}</div>
              <div class="text-sm opacity-70">{new Date(expense.date).toLocaleDateString('id-ID')}</div>
            </td>
            <td>
              <span class={`badge ${
                expense.category === 'operasional' ? 'badge-primary' :
                expense.category === 'marketing' ? 'badge-info' :
                expense.category === 'gaji' ? 'badge-warning' :
                'badge-neutral'
              }`}>
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