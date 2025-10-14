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
  import type { RevenueReportData } from "$lib/types";

  export let reportData: RevenueReportData | null | undefined;

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
  let revenueDistributionCanvas: HTMLCanvasElement;
  let paymentMethodRevenueCanvas: HTMLCanvasElement;
  let revenueAnalysisCanvas: HTMLCanvasElement;

  // Chart instances
  let revenueDistributionChart: ChartJS;
  let paymentMethodRevenueChart: ChartJS;
  let revenueAnalysisChart: ChartJS;

  // Prepare data for the charts
  $: revenueDistributionChartData = {
    labels: ["Pendapatan", "Pengeluaran"],
    datasets: [
      {
        label: "Jumlah (Rp)",
        data: [
          reportData ? reportData.totalRevenue : 0,
          reportData ? reportData.totalExpenses : 0,
        ],
        backgroundColor: [
          "rgba(16, 185, 129, 0.8)", // Revenue - daisyUI success (emerald-500)
          "rgba(124, 58, 237, 0.8)", // Expenses - daisyUI secondary (violet-600)
        ],
        borderColor: [
          "rgba(16, 185, 129, 1)",
          "rgba(124, 58, 237, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };

  // Prepare data for payment method revenue chart
  $: paymentMethodRevenueChartData = {
    labels: ["Transfer", "QRIS", "Tunai"],
    datasets: [
      {
        label: "Pendapatan per Metode",
        data: [
          reportData?.revenueByPaymentMethod?.transfer || 0,
          reportData?.revenueByPaymentMethod?.qris || 0,
          reportData?.revenueByPaymentMethod?.cash || 0,
        ],
        backgroundColor: [
          "rgba(79, 70, 229, 0.8)", // Transfer - daisyUI primary (indigo-500)
          "rgba(124, 58, 237, 0.8)", // QRIS - daisyUI secondary (violet-600)
          "rgba(245, 158, 11, 0.8)", // Cash - daisyUI warning (amber-500)
        ],
        borderColor: [
          "rgba(79, 70, 229, 1)", // Transfer
          "rgba(124, 58, 237, 1)", // QRIS
          "rgba(245, 158, 11, 1)", // Cash
        ],
        borderWidth: 1,
      },
    ],
  };

  // Prepare data for revenue analysis chart
  $: revenueAnalysisChartData = {
    labels: reportData?.topRevenueProducts?.map(product => product.name) || [],
    datasets: [
      {
        label: "Total Pendapatan (Rp)",
        data: reportData?.topRevenueProducts?.map(product => product.totalRevenue) || [],
        backgroundColor: "rgba(245, 158, 11, 0.8)", // daisyUI warning (amber-500)
        borderColor: "rgba(245, 158, 11, 1)",
        borderWidth: 1,
      },
    ],
  };

  // Chart options
  const revenueDistributionChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: "Distribusi Pendapatan vs Pengeluaran",
      },
    },
  };

  const paymentMethodRevenueChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: "Pendapatan berdasarkan Metode Pembayaran",
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
    // Create revenue distribution chart
    if (revenueDistributionCanvas && reportData) {
      revenueDistributionChart = new ChartJS(revenueDistributionCanvas, {
        type: "doughnut",
        data: revenueDistributionChartData,
        options: revenueDistributionChartOptions,
      });
    }

    // Create payment method revenue chart
    if (paymentMethodRevenueCanvas && reportData) {
      paymentMethodRevenueChart = new ChartJS(paymentMethodRevenueCanvas, {
        type: "bar",
        data: paymentMethodRevenueChartData,
        options: paymentMethodRevenueChartOptions,
      });
    }

    // Create revenue analysis chart
    if (revenueAnalysisCanvas && reportData) {
      revenueAnalysisChart = new ChartJS(revenueAnalysisCanvas, {
        type: "bar",
        data: revenueAnalysisChartData,
        options: revenueAnalysisChartOptions,
      });
    }
  });

  onDestroy(() => {
    // Clean up charts to prevent memory leaks
    if (revenueDistributionChart) {
      revenueDistributionChart.destroy();
    }
    if (paymentMethodRevenueChart) {
      paymentMethodRevenueChart.destroy();
    }
    if (revenueAnalysisChart) {
      revenueAnalysisChart.destroy();
    }
  });

  // Update charts when data changes
  $: if (revenueDistributionChart && reportData) {
    revenueDistributionChart.data = revenueDistributionChartData;
    revenueDistributionChart.update();
  }

  $: if (paymentMethodRevenueChart && reportData) {
    paymentMethodRevenueChart.data = paymentMethodRevenueChartData;
    paymentMethodRevenueChart.update();
  }

  $: if (revenueAnalysisChart && reportData) {
    revenueAnalysisChart.data = revenueAnalysisChartData;
    revenueAnalysisChart.update();
  }
</script>

<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
  <!-- Revenue Distribution Chart -->
  <div class="bg-base-100 p-4 rounded-lg shadow">
    {#if reportData && reportData.totalRevenue + reportData.totalExpenses > 0}
      <div class="h-80">
        <canvas bind:this={revenueDistributionCanvas}></canvas>
      </div>
    {:else}
      <p class="text-center text-gray-500">Tidak ada data</p>
    {/if}
  </div>

  <!-- Payment Method Revenue Chart -->
  <div class="bg-base-100 p-4 rounded-lg shadow">
    {#if reportData && (reportData.revenueByPaymentMethod?.transfer || reportData.revenueByPaymentMethod?.qris || reportData.revenueByPaymentMethod?.cash)}
      <div class="h-80">
        <canvas bind:this={paymentMethodRevenueCanvas}></canvas>
      </div>
    {:else}
      <p class="text-center text-gray-500">Tidak ada data</p>
    {/if}
  </div>

  <!-- Revenue Analysis Chart -->
  <div class="bg-base-100 p-4 rounded-lg shadow lg:col-span-2">
    {#if reportData && reportData.topRevenueProducts && reportData.topRevenueProducts.length > 0}
      <div class="h-80">
        <canvas bind:this={revenueAnalysisCanvas}></canvas>
      </div>
    {:else}
      <p class="text-center text-gray-500">Tidak ada data</p>
    {/if}
  </div>
</div>