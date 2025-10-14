<script lang="ts">
  import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
    Title,
    DoughnutController,
    BarElement,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarController,
  } from "chart.js";
  import { onMount, onDestroy } from "svelte";
  import type { MarginReportData } from "$lib/types";

  export let reportData: MarginReportData | null | undefined;

  // Register Chart.js components needed for doughnut and bar charts
  ChartJS.register(
    ArcElement,
    Tooltip,
    Legend,
    Title,
    DoughnutController,
    BarController,
    BarElement,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement
  );

  // Canvas elements for the charts
  let marginDistributionCanvas: HTMLCanvasElement;
  let productMarginsCanvas: HTMLCanvasElement;
  let marginAnalysisCanvas: HTMLCanvasElement;

  // Chart instances
  let marginDistributionChart: ChartJS;
  let productMarginsChart: ChartJS;
  let marginAnalysisChart: ChartJS;

  // Prepare data for the charts
  $: marginDistributionChartData = {
    labels: ["Pendapatan", "Biaya", "Pengeluaran"],
    datasets: [
      {
        label: "Jumlah (Rp)",
        data: reportData ? [
          reportData.totalRevenue || 0,
          reportData.totalCost || 0,
          reportData.totalExpenses || 0,
        ] : [0, 0, 0],
        backgroundColor: [
          "rgba(16, 185, 129, 0.8)", // Revenue - daisyUI success (emerald-500)
          "rgba(239, 68, 68, 0.8)", // Cost - daisyUI error (red-500)
          "rgba(124, 58, 237, 0.8)", // Expenses - daisyUI secondary (violet-600)
        ],
        borderColor: [
          "rgba(16, 185, 129, 1)",
          "rgba(239, 68, 68, 1)",
          "rgba(124, 58, 237, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };

  // Prepare data for product margins chart
  $: productMarginsChartData = {
    labels: reportData && reportData.productMargins ? reportData.productMargins.map(product => product.name) : [],
    datasets: [
      {
        label: "Margin (%)",
        data: reportData && reportData.productMargins ? reportData.productMargins.map(product => parseFloat(product.margin.toFixed(2))) : [],
        backgroundColor: "rgba(124, 58, 237, 0.8)", // daisyUI secondary (violet-600)
        borderColor: "rgba(124, 58, 237, 1)",
        borderWidth: 1,
      },
    ],
  };

  // Prepare data for margin analysis chart
  $: marginAnalysisChartData = {
    labels: reportData ? ["Gross Margin", "Net Margin"] : [],
    datasets: [
      {
        label: "Margin (%)",
        data: reportData ? [
          reportData.grossMargin || 0,
          reportData.netMargin || 0,
        ] : [0, 0],
        backgroundColor: "rgba(16, 185, 129, 0.8)", // daisyUI success (emerald-500)
        borderColor: "rgba(16, 185, 129, 1)",
        borderWidth: 1,
      },
    ],
  };

  // Chart options
  const marginDistributionChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: "Distribusi Pendapatan, Biaya & Pengeluaran",
      },
    },
  };

  const productMarginsChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: "Margin Produk Teratas",
      },
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
  };

  const marginAnalysisChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: "Analisis Margin Keseluruhan",
      },
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
  };

  onMount(() => {
    // Create margin distribution chart
    if (marginDistributionCanvas && reportData) {
      marginDistributionChart = new ChartJS(marginDistributionCanvas, {
        type: "doughnut",
        data: marginDistributionChartData,
        options: marginDistributionChartOptions,
      });
    }

    // Create product margins chart
    if (productMarginsCanvas && reportData && reportData.productMargins) {
      productMarginsChart = new ChartJS(productMarginsCanvas, {
        type: "bar",
        data: productMarginsChartData,
        options: productMarginsChartOptions,
      });
    }

    // Create margin analysis chart
    if (marginAnalysisCanvas && reportData) {
      marginAnalysisChart = new ChartJS(marginAnalysisCanvas, {
        type: "bar",
        data: marginAnalysisChartData,
        options: marginAnalysisChartOptions,
      });
    }
  });

  onDestroy(() => {
    // Clean up charts to prevent memory leaks
    if (marginDistributionChart) {
      marginDistributionChart.destroy();
    }
    if (productMarginsChart) {
      productMarginsChart.destroy();
    }
    if (marginAnalysisChart) {
      marginAnalysisChart.destroy();
    }
  });

  // Update charts when data changes
  $: if (marginDistributionChart && reportData) {
    marginDistributionChart.data = marginDistributionChartData;
    marginDistributionChart.update();
  }

  $: if (productMarginsChart && reportData && reportData.productMargins) {
    productMarginsChart.data = productMarginsChartData;
    productMarginsChart.update();
  }

  $: if (marginAnalysisChart && reportData) {
    marginAnalysisChart.data = marginAnalysisChartData;
    marginAnalysisChart.update();
  }
</script>

<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
  <!-- Margin Distribution Chart -->
  <div class="bg-base-100 p-4 rounded-lg shadow">
    {#if reportData && (reportData.totalRevenue || reportData.totalCost || reportData.totalExpenses)}
      <div class="h-80">
        <canvas bind:this={marginDistributionCanvas}></canvas>
      </div>
    {:else}
      <p class="text-center text-gray-500">Tidak ada data</p>
    {/if}
  </div>

  <!-- Product Margins Chart -->
  <div class="bg-base-100 p-4 rounded-lg shadow">
    {#if reportData && reportData.productMargins && reportData.productMargins.length > 0}
      <div class="h-80">
        <canvas bind:this={productMarginsCanvas}></canvas>
      </div>
    {:else}
      <p class="text-center text-gray-500">Tidak ada data</p>
    {/if}
  </div>

  <!-- Margin Analysis Chart -->
  <div class="bg-base-100 p-4 rounded-lg shadow lg:col-span-2">
    {#if reportData && (reportData.grossMargin !== undefined || reportData.netMargin !== undefined)}
      <div class="h-80">
        <canvas bind:this={marginAnalysisCanvas}></canvas>
      </div>
    {:else}
      <p class="text-center text-gray-500">Tidak ada data</p>
    {/if}
  </div>
</div>