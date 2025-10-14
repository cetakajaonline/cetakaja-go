<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import type { MarginReportData } from "$lib/types";
  import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
  import type { ChartConfiguration } from 'chart.js';

  export let reportData: MarginReportData | null | undefined;

  let canvasElement: HTMLCanvasElement;
  let chart: ChartJS;

  // Register ChartJS components
  ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

  onMount(() => {
    if (canvasElement && reportData && reportData.productMargins) {
      // Prepare chart data
      const chartData = {
        labels: reportData.productMargins.map(product => product.name),
        datasets: [
          {
            label: 'Margin (%)',
            data: reportData.productMargins.map(product => parseFloat(product.margin.toFixed(2))),
            backgroundColor: [
              'rgba(54, 162, 235, 0.5)',
              'rgba(255, 99, 132, 0.5)',
              'rgba(255, 205, 86, 0.5)',
              'rgba(75, 192, 192, 0.5)',
              'rgba(153, 102, 255, 0.5)',
              'rgba(255, 159, 64, 0.5)',
              'rgba(199, 199, 199, 0.5)',
              'rgba(83, 102, 255, 0.5)',
              'rgba(255, 99, 255, 0.5)',
              'rgba(99, 255, 132, 0.5)'
            ],
            borderColor: [
              'rgb(54, 162, 235)',
              'rgb(255, 99, 132)',
              'rgb(255, 205, 86)',
              'rgb(75, 192, 192)',
              'rgb(153, 102, 255)',
              'rgb(255, 159, 64)',
              'rgb(199, 199, 199)',
              'rgb(83, 102, 255)',
              'rgb(255, 99, 255)',
              'rgb(99, 255, 132)'
            ],
            borderWidth: 1,
          }
        ]
      };

      const chartConfig: ChartConfiguration<'bar'> = {
        type: 'bar',
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
              text: 'Margin Produk Teratas'
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                callback: function(value: any) {
                  return value + '%';
                }
              }
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