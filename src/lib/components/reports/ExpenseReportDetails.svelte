<script lang="ts">
  import { formatCurrency, capitalizeFirstLetter } from "$lib/utils/formatters";
  import type { ExpenseReportData } from "$lib/types";

  export let reportData: ExpenseReportData | null | undefined;

  // Function to determine the time period based on date range
  function getTimePeriodLabel(): string {
    if (reportData && reportData.date) {
      // For expense report, we'll use the date property if available
      const reportDate = new Date(reportData.date);
      return reportDate.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    }
    return "Tahun Ini";
  }
</script>

{#if reportData}
  <div>
    <h3 class="text-xl font-bold m-6 text-center">
      Rincian Pengeluaran {getTimePeriodLabel()}
    </h3>
    <div class="overflow-x-auto">
      <table class="table table-zebra">
        <thead>
          <tr>
            <th>Tanggal</th>
            <th>Kategori</th>
            <th>Deskripsi</th>
            <th class="text-right">Nominal</th>
          </tr>
        </thead>
        <tbody>
          {#each reportData.expenses as expense}
            <tr>
              <td
                >{new Date(expense.date).toLocaleDateString("id-ID", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}</td
              >
              <td>
                <span class="badge badge-primary">
                  {expense.category === "operasional"
                    ? "Operasional"
                    : expense.category === "marketing"
                      ? "Marketing"
                      : expense.category === "gaji"
                        ? "Gaji"
                        : "Lainnya"}
                </span>
              </td>
              <td>{expense.description || "-"}</td>
              <td class="text-right">{formatCurrency(expense.nominal)}</td>
            </tr>
          {:else}
            <tr>
              <td colspan="4">Tidak ada data pengeluaran dalam periode ini.</td>
            </tr>
          {/each}
          <tr class="font-bold">
            <td></td>
            <td></td>
            <td class="text-right">Total</td>
            <td class="text-right">
              {formatCurrency(
                reportData.expenses
                  ? reportData.expenses.reduce(
                      (sum, expense) => sum + expense.nominal,
                      0
                    )
                  : 0
              )}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
{:else}
  <div class="text-center text-gray-500 py-8">Loading data...</div>
{/if}
