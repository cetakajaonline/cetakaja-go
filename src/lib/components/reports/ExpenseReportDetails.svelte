<script lang="ts">
  import type { ExpenseReportData } from "$lib/types";

  export let reportData: ExpenseReportData;

  // Format currency
  function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  }
</script>

<div class="bg-white p-6 rounded-xl shadow border">
  <h3 class="text-lg font-semibold mb-4">Detail Pengeluaran</h3>
  
  <div class="overflow-x-auto">
    <table class="table table-compact w-full">
      <thead>
        <tr>
          <th>Kategori</th>
          <th>Nominal</th>
          <th>Deskripsi</th>
          <th>Tanggal</th>
        </tr>
      </thead>
      <tbody>
        {#each reportData.expenses as expense}
          <tr>
            <td>
              <span class="badge badge-primary">
                {expense.category === 'operasional' ? 'Operasional' : 
                 expense.category === 'marketing' ? 'Marketing' : 
                 expense.category === 'gaji' ? 'Gaji' : 'Lainnya'}
              </span>
            </td>
            <td>{formatCurrency(expense.nominal)}</td>
            <td>{expense.description || '-'}</td>
            <td>{new Date(expense.date).toLocaleDateString('id-ID')}</td>
          </tr>
        {:else}
          <tr>
            <td colspan="4" class="text-center">Tidak ada data pengeluaran</td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</div>