<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import type { ReportResponse, DailyReportUI, WeeklyReportUI, MonthlyReportUI, AnnualReportUI, ProductReportUI, CustomerReportUI, RevenueReportUI, ExpenseReportUI } from '$lib/types';
  import {
    Chart,
    BarController,
    BarElement,
    CategoryScale,
    LinearScale,
    Title,
    Tooltip,
    Legend
  } from 'chart.js';

  // Register Chart.js components
  Chart.register(BarController, BarElement, CategoryScale, LinearScale, Title, Tooltip, Legend);

  let { report, loading }: { report: ReportResponse | null; loading: boolean } = $props();
  let chartContainer: HTMLCanvasElement | null = $state(null);
  let chart: Chart | null = null;

  // Sample chart data based on report type
  let chartData: { labels: string[]; values: number[] } = $state({ labels: [], values: [] });
  let maxValue: number = $state(0);

  // Use a variable that's not reactive for tracking last processed report
  let lastProcessedReportSignature: string | null = null;
  
  $effect(() => {
    // Create a signature to identify this specific report
    const currentSignature = report ? `${report.reportType}_${report.dateRange?.start?.toString()}_${report.dateRange?.end?.toString()}` : null;
    
    // Only process if this is a different report
    if (currentSignature !== lastProcessedReportSignature) {
      lastProcessedReportSignature = currentSignature;
      
      if (report && !loading) {
        processReportData();
        
        // Update chart only if it already exists, otherwise create it
        if (chart) {
          updateChart();
        } else {
          initChart();
        }
      } else if (!report && chart) {
        // Destroy chart when report is null
        chart.destroy();
        chart = null;
      }
    }
  });

  function updateChart() {
    if (!chart || !chartData.labels.length) return;
    
    // Update chart data with cloned arrays to avoid Svelte 5 reactivity conflicts
    chart.data.labels = [...chartData.labels];
    chart.data.datasets[0].data = [...chartData.values];
    if (chart.options.plugins?.title) {
      (chart.options.plugins.title as { text: string }).text = getChartTitle();
    }
    chart.update();
  }

  function processReportData() {
    if (!report || !report.data) return;

    // Initialize empty chart data
    chartData = { labels: [], values: [] };
    
    // Extract chart data based on report type using new UI-focused data structures
    switch (report.reportType) {
      case 'daily':
        const dailyData = report.data as DailyReportUI;
        chartData = {
          labels: ['Total Orders', 'Revenue', 'Expenses', 'Net'],
          values: [
            dailyData.totalOrders || 0,
            dailyData.totalRevenue || 0,
            dailyData.totalExpenses || 0,
            dailyData.netRevenue || 0
          ]
        };
        break;
      case 'weekly':
        const weeklyData = report.data as WeeklyReportUI;
        chartData = {
          labels: ['Total Orders', 'Revenue', 'Expenses', 'Net'],
          values: [
            weeklyData.weeklyStats?.totalOrders || 0,
            weeklyData.weeklyStats?.totalRevenue || 0,
            weeklyData.weeklyStats?.totalExpenses || 0,
            weeklyData.weeklyStats?.netRevenue || 0
          ]
        };
        break;
      case 'monthly':
        const monthlyData = report.data as MonthlyReportUI;
        chartData = {
          labels: ['Total Orders', 'Revenue', 'Expenses', 'Net'],
          values: [
            monthlyData.monthlyStats?.totalOrders || 0,
            monthlyData.monthlyStats?.totalRevenue || 0,
            monthlyData.monthlyStats?.totalExpenses || 0,
            monthlyData.monthlyStats?.netRevenue || 0
          ]
        };
        break;
      case 'annual':
        const annualData = report.data as AnnualReportUI;
        chartData = {
          labels: ['Total Orders', 'Revenue', 'Expenses', 'Net'],
          values: [
            annualData.annualStats?.totalOrders || 0,
            annualData.annualStats?.totalRevenue || 0,
            annualData.annualStats?.totalExpenses || 0,
            annualData.annualStats?.netRevenue || 0
          ]
        };
        break;
      case 'product':
        const productData = report.data as ProductReportUI;
        chartData = {
          labels: ['Total Products', 'Total Sold', 'Total Revenue'],
          values: [
            productData.totalProducts || 0,
            productData.totalSold || 0,
            productData.totalRevenue || 0
          ]
        };
        break;
      case 'customer':
        const customerData = report.data as CustomerReportUI;
        chartData = {
          labels: ['Total Customers', 'Total Orders', 'Total Revenue'],
          values: [
            customerData.totalCustomers || 0,
            customerData.totalOrders || 0,
            customerData.totalRevenue || 0
          ]
        };
        break;
      case 'revenue':
        const revenueData = report.data as RevenueReportUI;
        chartData = {
          labels: ['Revenue'],
          values: [revenueData.totalRevenue || 0]
        };
        break;
      case 'expense':
        const expenseData = report.data as ExpenseReportUI;
        chartData = {
          labels: ['Expenses'],
          values: [expenseData.totalExpenses || 0]
        };
        break;
      default:
        chartData = {
          labels: ['Data'],
          values: [report.summary?.total || 0]
        };
    }

    // Calculate max value for chart scaling
    maxValue = Math.max(...chartData.values, 100); // Ensure minimum scale of 100
  }

  function initChart() {
    if (!chartContainer || !report) return;

    // Update existing chart if available, otherwise create new one
    if (chart) {
      // Update the existing chart data
      chart.data.labels = [...chartData.labels];
      chart.data.datasets[0].data = [...chartData.values];
      if (chart.options.plugins && chart.options.plugins.title) {
        chart.options.plugins.title.text = getChartTitle();
      }
      chart.update();
    } else {
      // Create new chart
      // Create a separate copy of chart data for Chart.js to avoid Svelte 5 $state conflicts
      const chartJSData = {
        labels: [...chartData.labels],
        datasets: [{
          label: 'Report Data',
          data: [...chartData.values],
          backgroundColor: [
            'rgba(54, 162, 235, 0.6)',
            'rgba(255, 99, 132, 0.6)',
            'rgba(255, 205, 86, 0.6)',
            'rgba(75, 192, 192, 0.6)'
          ],
          borderColor: [
            'rgba(54, 162, 235, 1)',
            'rgba(255, 99, 132, 1)',
            'rgba(255, 205, 86, 1)',
            'rgba(75, 192, 192, 1)'
          ],
          borderWidth: 1
        }]
      };

      chart = new Chart(chartContainer, {
        type: 'bar',
        data: chartJSData,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            },
            title: {
              display: true,
              text: getChartTitle()
            }
          },
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      });
    }
  }

  function getChartTitle(): string {
    if (!report) return 'Report Data';
    
    switch (report.reportType) {
      case 'daily': return 'Daily Report';
      case 'weekly': return 'Weekly Report';
      case 'monthly': return 'Monthly Report';
      case 'annual': return 'Annual Report';
      case 'product': return 'Product Performance';
      case 'customer': return 'Customer Report';
      case 'revenue': return 'Revenue Report';
      case 'expense': return 'Expense Report';
      default: return 'Report Data';
    }
  }

  onMount(() => {
    if (report && !loading) {
      initChart();
    }
  });

  onDestroy(() => {
    if (chart) {
      chart.destroy();
      chart = null;
    }
  });
</script>

<div class="card bg-base-100 shadow-md p-4">
  <h3 class="text-lg font-semibold mb-4">Grafik Laporan</h3>
  
  {#if loading}
    <div class="flex justify-center items-center h-64">
      <span class="loading loading-spinner loading-lg"></span>
    </div>
  {:else if report}
    <div class="chart-container h-64">
      <canvas bind:this={chartContainer}></canvas>
    </div>
  {:else}
    <div class="text-center py-8 text-gray-500">
      <p>Silakan pilih laporan untuk melihat grafik</p>
    </div>
  {/if}
</div>