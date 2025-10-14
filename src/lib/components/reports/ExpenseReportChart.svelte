<script lang="ts">
  import { onMount } from "svelte";
  import type { ExpenseReportData } from "$lib/types";
  import { Pie } from "svelte-chartjs";
  import { Chart as ChartJS, ArcElement, Tooltip, Legend, Title } from 'chart.js';

  export let reportData: ExpenseReportData;

  // Register ChartJS components
  ChartJS.register(ArcElement, Tooltip, Legend, Title);

  let chartData: {
    labels: string[];
    datasets: {
      data: number[];
      backgroundColor: string[];
      borderColor: string[];
      borderWidth: number;
    }[];
  } = {
    labels: [],
    datasets: []
  };

  let chartOptions: any = {
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
  };

  onMount(() => {
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

    chartData = {
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
  });
</script>

<div class="bg-white p-6 rounded-xl shadow border h-96">
  <Pie {chartData} {chartOptions} />
</div>