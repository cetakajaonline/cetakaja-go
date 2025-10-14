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
  import type { ProductReportData } from "$lib/types";

  export let reportData: ProductReportData;

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
  let productDistributionCanvas: HTMLCanvasElement;
  let salesPerformanceCanvas: HTMLCanvasElement;
  let revenueAnalysisCanvas: HTMLCanvasElement;

  // Chart instances
  let productDistributionChart: ChartJS;
  let salesPerformanceChart: ChartJS;
  let revenueAnalysisChart: ChartJS;

  // Prepare data for the charts
  $: productDistributionChartData = {
    labels: ["Produk Terjual", "Produk Tidak Terjual"],
    datasets: [
      {
        label: "Jumlah Produk",
        data: [
          reportData.totalSold,
          reportData.totalProducts - reportData.totalSold,
        ],
        backgroundColor: [
          "rgba(40, 167, 69, 0.8)", // Sold products - green
          "rgba(220, 53, 69, 0.8)", // Unsold products - red
        ],
        borderColor: [
          "rgba(40, 167, 69, 1)",
          "rgba(220, 53, 69, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };

  // Prepare data for sales performance chart
  $: salesPerformanceChartData = {
    labels: reportData.topSellingProducts.map(product => product.name),
    datasets: [
      {
        label: "Jumlah Terjual",
        data: reportData.topSellingProducts.map(product => product.totalSold),
        backgroundColor: "rgba(0, 123, 255, 0.8)", // Blue
        borderColor: "rgba(0, 123, 255, 1)",
        borderWidth: 1,
      },
    ],
  };

  // Prepare data for revenue analysis chart
  $: revenueAnalysisChartData = {
    labels: reportData.topSellingProducts.map(product => product.name),
    datasets: [
      {
        label: "Total Pendapatan (Rp)",
        data: reportData.topSellingProducts.map(product => product.totalRevenue),
        backgroundColor: "rgba(255, 193, 7, 0.8)", // Yellow
        borderColor: "rgba(255, 193, 7, 1)",
        borderWidth: 1,
      },
    ],
  };

  // Chart options
  const productDistributionChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: "Distribusi Produk",
      },
    },
  };

  const salesPerformanceChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: "Performa Penjualan Produk Terbaik",
      },
    },
  };

  const revenueAnalysisChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: "Analisis Pendapatan Produk Terbaik",
      },
    },
  };

  onMount(() => {
    // Create product distribution chart
    if (productDistributionCanvas) {
      productDistributionChart = new ChartJS(productDistributionCanvas, {
        type: "doughnut",
        data: productDistributionChartData,
        options: productDistributionChartOptions,
      });
    }

    // Create sales performance chart
    if (salesPerformanceCanvas) {
      salesPerformanceChart = new ChartJS(salesPerformanceCanvas, {
        type: "bar",
        data: salesPerformanceChartData,
        options: salesPerformanceChartOptions,
      });
    }

    // Create revenue analysis chart
    if (revenueAnalysisCanvas) {
      revenueAnalysisChart = new ChartJS(revenueAnalysisCanvas, {
        type: "bar",
        data: revenueAnalysisChartData,
        options: revenueAnalysisChartOptions,
      });
    }
  });

  onDestroy(() => {
    // Clean up charts to prevent memory leaks
    if (productDistributionChart) {
      productDistributionChart.destroy();
    }
    if (salesPerformanceChart) {
      salesPerformanceChart.destroy();
    }
    if (revenueAnalysisChart) {
      revenueAnalysisChart.destroy();
    }
  });

  // Update charts when data changes
  $: if (productDistributionChart) {
    productDistributionChart.data = productDistributionChartData;
    productDistributionChart.update();
  }

  $: if (salesPerformanceChart) {
    salesPerformanceChart.data = salesPerformanceChartData;
    salesPerformanceChart.update();
  }

  $: if (revenueAnalysisChart) {
    revenueAnalysisChart.data = revenueAnalysisChartData;
    revenueAnalysisChart.update();
  }
</script>

<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
  <!-- Product Distribution Chart -->
  <div class="bg-base-100 p-4 rounded-lg shadow">
    {#if reportData.totalProducts > 0}
      <div class="h-80">
        <canvas bind:this={productDistributionCanvas}></canvas>
      </div>
    {:else}
      <p class="text-center text-gray-500">Tidak ada data</p>
    {/if}
  </div>

  <!-- Sales Performance Chart -->
  <div class="bg-base-100 p-4 rounded-lg shadow">
    {#if reportData.topSellingProducts.length > 0}
      <div class="h-80">
        <canvas bind:this={salesPerformanceCanvas}></canvas>
      </div>
    {:else}
      <p class="text-center text-gray-500">Tidak ada data</p>
    {/if}
  </div>

  <!-- Revenue Analysis Chart -->
  <div class="bg-base-100 p-4 rounded-lg shadow lg:col-span-2">
    {#if reportData.topSellingProducts.length > 0}
      <div class="h-80">
        <canvas bind:this={revenueAnalysisCanvas}></canvas>
      </div>
    {:else}
      <p class="text-center text-gray-500">Tidak ada data</p>
    {/if}
  </div>
</div>