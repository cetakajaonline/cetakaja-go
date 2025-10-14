<script lang="ts">
  import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
    Title,
    DoughnutController,
  } from "chart.js";
  import { onMount, onDestroy } from "svelte";
  import type { AnnualReportData } from "$lib/types";

  export let reportData: AnnualReportData;

  // Register Chart.js components needed for doughnut charts
  ChartJS.register(ArcElement, Tooltip, Legend, Title, DoughnutController);

  // Canvas elements for the charts
  let orderStatusCanvas: HTMLCanvasElement;
  let revenueExpenseCanvas: HTMLCanvasElement;

  // Chart instances
  let orderStatusChart: ChartJS;
  let revenueExpenseChart: ChartJS;

  // Prepare data for the charts
  $: orderStatusChartData = {
    labels: ["Pending", "Processing", "Finished", "Canceled"],
    datasets: [
      {
        label: "Jumlah Order",
        data: [
          reportData.ordersByStatus?.pending || 0,
          reportData.ordersByStatus?.processing || 0,
          reportData.ordersByStatus?.finished || 0,
          reportData.ordersByStatus?.canceled || 0,
        ],
        backgroundColor: [
          "rgba(255, 193, 7, 0.8)", // Pending - yellow
          "rgba(0, 123, 255, 0.8)", // Processing - blue
          "rgba(40, 167, 69, 0.8)", // Finished - green
          "rgba(220, 53, 69, 0.8)", // Canceled - red
        ],
        borderColor: [
          "rgba(255, 193, 7, 1)",
          "rgba(0, 123, 255, 1)",
          "rgba(40, 167, 69, 1)",
          "rgba(220, 53, 69, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };

  // Prepare data for revenue vs expenses chart
  $: revenueExpenseChartData = {
    labels: ["Pendapatan", "Pengeluaran"],
    datasets: [
      {
        label: "Rp",
        data: [reportData.totalRevenue || 0, reportData.totalExpenses || 0],
        backgroundColor: [
          "rgba(40, 167, 69, 0.8)", // Revenue - green
          "rgba(220, 53, 69, 0.8)", // Expenses - red
        ],
        borderColor: ["rgba(40, 167, 69, 1)", "rgba(220, 53, 69, 1)"],
        borderWidth: 1,
      },
    ],
  };

  // Chart options
  const orderStatusChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: "Status Pesanan Tahunan",
      },
    },
  };

  const revenueExpenseChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: "Pendapatan vs Pengeluaran Tahunan",
      },
    },
  };

  onMount(() => {
    // Create order status chart
    if (orderStatusCanvas) {
      orderStatusChart = new ChartJS(orderStatusCanvas, {
        type: "doughnut",
        data: orderStatusChartData,
        options: orderStatusChartOptions,
      });
    }

    // Create revenue vs expenses chart
    if (revenueExpenseCanvas) {
      revenueExpenseChart = new ChartJS(revenueExpenseCanvas, {
        type: "doughnut",
        data: revenueExpenseChartData,
        options: revenueExpenseChartOptions,
      });
    }
  });

  onDestroy(() => {
    // Clean up charts to prevent memory leaks
    if (orderStatusChart) {
      orderStatusChart.destroy();
    }
    if (revenueExpenseChart) {
      revenueExpenseChart.destroy();
    }
  });

  // Update charts when data changes
  $: if (orderStatusChart) {
    orderStatusChart.data = orderStatusChartData;
    orderStatusChart.update();
  }

  $: if (revenueExpenseChart) {
    revenueExpenseChart.data = revenueExpenseChartData;
    revenueExpenseChart.update();
  }
</script>

<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
  <!-- Order Status Chart -->
  <div class="bg-base-100 p-4 rounded-lg shadow">
    {#if reportData.ordersByStatus}
      <div class="h-80">
        <canvas bind:this={orderStatusCanvas}></canvas>
      </div>
    {:else}
      <p class="text-center text-gray-500">Tidak ada data</p>
    {/if}
  </div>

  <!-- Revenue vs Expenses Chart -->
  <div class="bg-base-100 p-4 rounded-lg shadow">
    {#if reportData.totalRevenue !== undefined && reportData.totalExpenses !== undefined}
      <div class="h-80">
        <canvas bind:this={revenueExpenseCanvas}></canvas>
      </div>
    {:else}
      <p class="text-center text-gray-500">Tidak ada data</p>
    {/if}
  </div>
</div>