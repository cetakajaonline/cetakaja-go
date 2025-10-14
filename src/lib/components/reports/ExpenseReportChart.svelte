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
  import type { ExpenseReportData } from "$lib/types";

  export let reportData: ExpenseReportData | null | undefined;

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
  let expenseDistributionCanvas: HTMLCanvasElement;
  let expenseCategoriesCanvas: HTMLCanvasElement;
  let expenseAnalysisCanvas: HTMLCanvasElement;

  // Chart instances
  let expenseDistributionChart: ChartJS;
  let expenseCategoriesChart: ChartJS;
  let expenseAnalysisChart: ChartJS;

  // Prepare data for the charts
  $: expenseDistributionChartData = {
    labels: reportData ? ["Pengeluaran", "Pendapatan"] : [],
    datasets: [
      {
        label: "Jumlah (Rp)",
        data: reportData ? [
          reportData.totalExpenses || 0,
          reportData.totalRevenue || 0,
        ] : [0, 0],
        backgroundColor: [
          "rgba(124, 58, 237, 0.8)", // Expenses - daisyUI secondary (violet-600)
          "rgba(16, 185, 129, 0.8)", // Revenue - daisyUI success (emerald-500)
        ],
        borderColor: [
          "rgba(124, 58, 237, 1)",
          "rgba(16, 185, 129, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };

  // Prepare data for expense categories chart
  $: expenseCategoriesChartData = {
    labels: reportData ? ["Operasional", "Marketing", "Gaji", "Lainnya"] : [],
    datasets: [
      {
        label: "Jumlah Pengeluaran",
        data: reportData ? [
          reportData.expenseCategories?.operational || 0,
          reportData.expenseCategories?.marketing || 0,
          reportData.expenseCategories?.gaji || 0,
          reportData.expenseCategories?.lainnya || 0,
        ] : [0, 0, 0, 0],
        backgroundColor: [
          "rgba(79, 70, 229, 0.8)", // Operasional - daisyUI primary (indigo-500)
          "rgba(245, 158, 11, 0.8)", // Marketing - daisyUI warning (amber-500)
          "rgba(16, 185, 129, 0.8)", // Gaji - daisyUI success (emerald-500)
          "rgba(124, 58, 237, 0.8)", // Lainnya - daisyUI secondary (violet-600)
        ],
        borderColor: [
          "rgba(79, 70, 229, 1)", // Operasional
          "rgba(245, 158, 11, 1)", // Marketing
          "rgba(16, 185, 129, 1)", // Gaji
          "rgba(124, 58, 237, 1)", // Lainnya
        ],
        borderWidth: 1,
      },
    ],
  };

  // Prepare data for expense analysis chart
  $: expenseAnalysisChartData = {
    labels: reportData ? ["Operasional", "Marketing", "Gaji", "Lainnya"] : [],
    datasets: [
      {
        label: "Total Pengeluaran (Rp)",
        data: reportData ? [
          reportData.expenseCategories?.operational || 0,
          reportData.expenseCategories?.marketing || 0,
          reportData.expenseCategories?.gaji || 0,
          reportData.expenseCategories?.lainnya || 0,
        ] : [0, 0, 0, 0],
        backgroundColor: "rgba(124, 58, 237, 0.8)", // daisyUI secondary (violet-600)
        borderColor: "rgba(124, 58, 237, 1)",
        borderWidth: 1,
      },
    ],
  };

  // Chart options
  const expenseDistributionChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: "Distribusi Pengeluaran vs Pendapatan",
      },
    },
  };

  const expenseCategoriesChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: "Distribusi Pengeluaran per Kategori",
      },
    },
  };

  const expenseAnalysisChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: "Analisis Pengeluaran per Kategori",
      },
    },
  };

  onMount(() => {
    // Create expense distribution chart
    if (expenseDistributionCanvas && reportData) {
      expenseDistributionChart = new ChartJS(expenseDistributionCanvas, {
        type: "doughnut",
        data: expenseDistributionChartData,
        options: expenseDistributionChartOptions,
      });
    }

    // Create expense categories chart
    if (expenseCategoriesCanvas && reportData) {
      expenseCategoriesChart = new ChartJS(expenseCategoriesCanvas, {
        type: "bar",
        data: expenseCategoriesChartData,
        options: expenseCategoriesChartOptions,
      });
    }

    // Create expense analysis chart
    if (expenseAnalysisCanvas && reportData) {
      expenseAnalysisChart = new ChartJS(expenseAnalysisCanvas, {
        type: "bar",
        data: expenseAnalysisChartData,
        options: expenseAnalysisChartOptions,
      });
    }
  });

  onDestroy(() => {
    // Clean up charts to prevent memory leaks
    if (expenseDistributionChart) {
      expenseDistributionChart.destroy();
    }
    if (expenseCategoriesChart) {
      expenseCategoriesChart.destroy();
    }
    if (expenseAnalysisChart) {
      expenseAnalysisChart.destroy();
    }
  });

  // Update charts when data changes
  $: if (expenseDistributionChart && reportData) {
    expenseDistributionChart.data = expenseDistributionChartData;
    expenseDistributionChart.update();
  }

  $: if (expenseCategoriesChart && reportData) {
    expenseCategoriesChart.data = expenseCategoriesChartData;
    expenseCategoriesChart.update();
  }

  $: if (expenseAnalysisChart && reportData) {
    expenseAnalysisChart.data = expenseAnalysisChartData;
    expenseAnalysisChart.update();
  }
</script>

<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
  <!-- Expense Distribution Chart -->
  <div class="bg-base-100 p-4 rounded-lg shadow">
    {#if reportData && (reportData.totalExpenses || reportData.totalRevenue)}
      <div class="h-80">
        <canvas bind:this={expenseDistributionCanvas}></canvas>
      </div>
    {:else}
      <p class="text-center text-gray-500">Tidak ada data</p>
    {/if}
  </div>

  <!-- Expense Categories Chart -->
  <div class="bg-base-100 p-4 rounded-lg shadow">
    {#if reportData && reportData.expenseCategories}
      <div class="h-80">
        <canvas bind:this={expenseCategoriesCanvas}></canvas>
      </div>
    {:else}
      <p class="text-center text-gray-500">Tidak ada data</p>
    {/if}
  </div>

  <!-- Expense Analysis Chart -->
  <div class="bg-base-100 p-4 rounded-lg shadow lg:col-span-2">
    {#if reportData && reportData.expenseCategories}
      <div class="h-80">
        <canvas bind:this={expenseAnalysisCanvas}></canvas>
      </div>
    {:else}
      <p class="text-center text-gray-500">Tidak ada data</p>
    {/if}
  </div>
</div>