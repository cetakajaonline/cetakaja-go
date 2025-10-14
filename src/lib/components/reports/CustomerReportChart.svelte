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
  import type { CustomerReportData } from "$lib/types";

  export let reportData: CustomerReportData;

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
  let customerDistributionCanvas: HTMLCanvasElement;
  let spendingPatternCanvas: HTMLCanvasElement;
  let orderFrequencyCanvas: HTMLCanvasElement;

  // Chart instances
  let customerDistributionChart: ChartJS;
  let spendingPatternChart: ChartJS;
  let orderFrequencyChart: ChartJS;

  // Prepare data for the charts
  $: customerDistributionChartData = {
    labels: ["New Customers", "Returning Customers"],
    datasets: [
      {
        label: "Jumlah Pelanggan",
        data: [
          reportData.totalCustomers - reportData.topCustomers.length,
          reportData.topCustomers.length,
        ],
        backgroundColor: [
          "rgba(245, 158, 11, 0.8)", // New customers - daisyUI warning (amber-500)
          "rgba(16, 185, 129, 0.8)", // Returning customers - daisyUI success (emerald-500)
        ],
        borderColor: [
          "rgba(245, 158, 11, 1)",
          "rgba(16, 185, 129, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };

  // Prepare data for spending pattern chart
  $: spendingPatternChartData = {
    labels: reportData.topCustomers.map(customer => customer.name),
    datasets: [
      {
        label: "Total Spent (Rp)",
        data: reportData.topCustomers.map(customer => customer.totalSpent),
        backgroundColor: "rgba(124, 58, 237, 0.8)", // daisyUI secondary (violet-600)
        borderColor: "rgba(124, 58, 237, 1)",
        borderWidth: 1,
      },
    ],
  };

  // Prepare data for order frequency chart
  $: orderFrequencyChartData = {
    labels: reportData.topCustomers.map(customer => customer.name),
    datasets: [
      {
        label: "Total Orders",
        data: reportData.topCustomers.map(customer => customer.totalOrders),
        backgroundColor: "rgba(239, 68, 68, 0.8)", // daisyUI error (red-500)
        borderColor: "rgba(239, 68, 68, 1)",
        borderWidth: 1,
      },
    ],
  };

  // Chart options
  const customerDistributionChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: "Distribusi Pelanggan",
      },
    },
  };

  const spendingPatternChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: "Pola Pengeluaran Pelanggan Terbaik",
      },
    },
  };

  const orderFrequencyChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: "Frekuensi Order Pelanggan Terbaik",
      },
    },
  };

  onMount(() => {
    // Create customer distribution chart
    if (customerDistributionCanvas) {
      customerDistributionChart = new ChartJS(customerDistributionCanvas, {
        type: "doughnut",
        data: customerDistributionChartData,
        options: customerDistributionChartOptions,
      });
    }

    // Create spending pattern chart
    if (spendingPatternCanvas) {
      spendingPatternChart = new ChartJS(spendingPatternCanvas, {
        type: "bar",
        data: spendingPatternChartData,
        options: spendingPatternChartOptions,
      });
    }

    // Create order frequency chart
    if (orderFrequencyCanvas) {
      orderFrequencyChart = new ChartJS(orderFrequencyCanvas, {
        type: "bar",
        data: orderFrequencyChartData,
        options: orderFrequencyChartOptions,
      });
    }
  });

  onDestroy(() => {
    // Clean up charts to prevent memory leaks
    if (customerDistributionChart) {
      customerDistributionChart.destroy();
    }
    if (spendingPatternChart) {
      spendingPatternChart.destroy();
    }
    if (orderFrequencyChart) {
      orderFrequencyChart.destroy();
    }
  });

  // Update charts when data changes
  $: if (customerDistributionChart) {
    customerDistributionChart.data = customerDistributionChartData;
    customerDistributionChart.update();
  }

  $: if (spendingPatternChart) {
    spendingPatternChart.data = spendingPatternChartData;
    spendingPatternChart.update();
  }

  $: if (orderFrequencyChart) {
    orderFrequencyChart.data = orderFrequencyChartData;
    orderFrequencyChart.update();
  }
</script>

<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
  <!-- Customer Distribution Chart -->
  <div class="bg-base-100 p-4 rounded-lg shadow">
    {#if reportData.totalCustomers > 0}
      <div class="h-80">
        <canvas bind:this={customerDistributionCanvas}></canvas>
      </div>
    {:else}
      <p class="text-center text-gray-500">Tidak ada data</p>
    {/if}
  </div>

  <!-- Spending Pattern Chart -->
  <div class="bg-base-100 p-4 rounded-lg shadow">
    {#if reportData.topCustomers.length > 0}
      <div class="h-80">
        <canvas bind:this={spendingPatternCanvas}></canvas>
      </div>
    {:else}
      <p class="text-center text-gray-500">Tidak ada data</p>
    {/if}
  </div>

  <!-- Order Frequency Chart -->
  <div class="bg-base-100 p-4 rounded-lg shadow lg:col-span-2">
    {#if reportData.topCustomers.length > 0}
      <div class="h-80">
        <canvas bind:this={orderFrequencyCanvas}></canvas>
      </div>
    {:else}
      <p class="text-center text-gray-500">Tidak ada data</p>
    {/if}
  </div>
</div>