<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import type { ExpenseReportData } from "$lib/types";
  import { Chart as ChartJS, ArcElement, Tooltip, Legend, Title } from 'chart.js';
  import type { ChartConfiguration } from 'chart.js';

  export let reportData: ExpenseReportData | null | undefined;

  let canvasElement: HTMLCanvasElement;
  let chart: ChartJS;

  // Register ChartJS components
  ChartJS.register(ArcElement, Tooltip, Legend, Title);

  onMount(() => {
    if (canvasElement && reportData && reportData.expenseCategories) {
      // Prepare chart data
      const labels = ['Operasional', 'Marketing', 'Gaji', 'Lainnya'];
      const data = [
        reportData.expenseCategories?.operational || 0,
        reportData.expenseCategories?.marketing || 0,
        reportData.expenseCategories?.gaji || 0,
        reportData.expenseCategories?.lainnya || 0
      ];

      // Only include categories with values
      const validData = labels.map((label, index) => ({ label, value: data[index] }))
        .filter(item => item.value > 0);

      const chartData = {
        labels: validData.map(item => item.label),
        datasets: [
          {
            data: validData.map(item => item.value),
            backgroundColor: [
              'rgba(54, 162, 235, 0.5)',
              'rgba(255, 99, 132, 0.5)',
              'rgba(255, 205, 86, 0.5)',
              'rgba(75, 192, 192, 0.5)',
            ],
            borderColor: [
              'rgb(54, 162, 235)',
              'rgb(255, 99, 132)',
              'rgb(255, 205, 86)',
              'rgb(75, 192, 192)',
            ],
            borderWidth: 1,
          }
        ]
      };

      const chartConfig: ChartConfiguration<'pie'> = {
        type: 'pie',
        data: chartData,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'top' as const,
            },
            title: {
              display: true,
              text: 'Distribusi Pengeluaran per Kategori'
            }
          }
        }
      };

      chart = new ChartJS(canvasElement, chartConfig);
    }
  });

  onDestroy(() => {
    if (chart) {
      chart.destroy();
    }
  });
</script>

{#if reportData}
  <div class="bg-white p-6 rounded-xl shadow border h-96">
    <canvas bind:this={canvasElement}></canvas>
  </div>
{:else}
  <div class="bg-white p-6 rounded-xl shadow border h-96 flex items-center justify-center">
    <div class="text-gray-500">Loading chart...</div>
  </div>
{/if}