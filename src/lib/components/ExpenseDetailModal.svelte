<script lang="ts">
  import type { Expense } from "$lib/types";

  export let show: boolean = false;
  export let expense: Expense | null;
  export let onClose: () => void;
  export let formatCurrency: (amount: number) => string;
  export let formatCategory: (category: string) => string;

  function formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  }
</script>

<div class="modal {show ? 'modal-open' : ''}">
  <div class="modal-box max-w-2xl">
    <h3 class="font-bold text-lg mb-4">Detail Pengeluaran</h3>

    {#if expense}
      <div class="space-y-4">
        <div class="flex justify-between items-center">
          <span class="text-gray-500">Nominal:</span>
          <span class="font-bold text-lg">{formatCurrency(expense.nominal)}</span>
        </div>

        <div class="flex justify-between items-center">
          <span class="text-gray-500">Kategori:</span>
          <span>{formatCategory(expense.category)}</span>
        </div>

        <div class="flex justify-between items-center">
          <span class="text-gray-500">Tanggal:</span>
          <span>{formatDate(expense.date)}</span>
        </div>

        <div class="flex justify-between items-center">
          <span class="text-gray-500">Deskripsi:</span>
          <span>{expense.description || '-'}</span>
        </div>

        <div class="flex justify-between items-center">
          <span class="text-gray-500">Bukti:</span>
          <span>
            {#if expense.proofFile}
              <a href="{expense.proofFile}" target="_blank" class="text-blue-500 hover:underline">Lihat File</a>
            {:else}
              -
            {/if}
          </span>
        </div>

        <div class="flex justify-between items-center">
          <span class="text-gray-500">Tanggal Dibuat:</span>
          <span>{formatDate(expense.createdAt)}</span>
        </div>

        <div class="flex justify-between items-center">
          <span class="text-gray-500">Tanggal Diupdate:</span>
          <span>{formatDate(expense.updatedAt)}</span>
        </div>
      </div>
    {/if}

    <div class="modal-action">
      <button 
        class="btn btn-outline"
        on:click={onClose}
      >
        Tutup
      </button>
    </div>
  </div>
</div>