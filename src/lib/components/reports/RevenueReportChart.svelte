<script lang="ts">
  import { onMount } from "svelte";
  import type { RevenueReportData } from "$lib/types";
  import { Bar } from "svelte-chartjs";
  import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

  export let reportData: RevenueReportData;

  // Register ChartJS components
  ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

  let chartData: {
    labels: string[];
    datasets: {
      label: string;
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
        text: 'Pendapatan Harian'
      }
    }
  };

  onMount(() => {
    // Prepare chart data
    chartData = {
      labels: reportData.topRevenueProducts.map(product => product.name),
      datasets: [
        {
          label: 'Pendapatan Produk',
          data: reportData.topRevenueProducts.map(product => product.totalRevenue),
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
  });
</script>

<div class="bg-white p-6 rounded-xl shadow border h-96">
  <Bar {chartData} {chartOptions} />
</div>