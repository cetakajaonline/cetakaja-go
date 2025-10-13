<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import type { ReportResponse } from '$lib/types';
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

  $effect(() => {
    if (report) {
      processReportData();
    }
    // Destroy and recreate chart when report changes
    if (chart) {
      chart.destroy();
      chart = null;
    }
    if (report && !loading) {
      initChart();
    }
  });

  function processReportData() {
    if (!report || !report.data) return;

    // Initialize empty chart data
    chartData = { labels: [], values: [] };
    
    // Extract chart data based on report type
    switch (report.reportType) {
      case 'daily':
      case 'weekly':
      case 'monthly':
      case 'annual':
        // For date-based reports, we might want to show day/month breakdown
        // For simplicity, we'll just show summary values
        chartData = {
          labels: ['Total Orders', 'Revenue', 'Expenses', 'Net'],
          values: [
            report.summary.total || 0,
            report.summary.revenue || 0,
            report.summary.expenses || 0,
            report.summary.net || 0
          ]
        };
        break;
      case 'product':
        // Product performance report - check if it's individual or all products
        // Type guard to check if it's an individual product report (has productId)
        if (report.data && typeof report.data === 'object' && 'productId' in report.data) {
          // Individual product report
          chartData = {
            labels: ['Items Sold', 'Revenue'],
            values: [report.summary.total || 0, report.summary.revenue || 0]
          };
        } else if (report.data && Array.isArray(report.data) && report.data[0] && 'totalProducts' in report.data[0]) {
          // All products report - use total products, total sold, total revenue
          chartData = {
            labels: ['Total Products', 'Total Sold', 'Total Revenue'],
            values: [
              (report.data as any[])[0].totalProducts || 0,
              (report.data as any[])[0].totalSold || 0,
              (report.data as any[])[0].totalRevenue || 0
            ]
          };
        }
        break;
      case 'customer':
        // Customer report - check if it's individual or all customers
        // Type guard to check if it's an individual customer report (has userId)
        if (report.data && typeof report.data === 'object' && 'userId' in report.data) {
          // Individual customer report
          chartData = {
            labels: ['Orders Count', 'Total Spent'],
            values: [report.summary.total || 0, report.summary.revenue || 0]
          };
        } else if (report.data && Array.isArray(report.data) && report.data[0] && 'totalCustomers' in report.data[0]) {
          // All customers report - use total customers, total orders, total revenue
          chartData = {
            labels: ['Total Customers', 'Total Orders', 'Total Revenue'],
            values: [
              (report.data as any[])[0].totalCustomers || 0,
              (report.data as any[])[0].totalOrders || 0,
              (report.data as any[])[0].totalRevenue || 0
            ]
          };
        }
        break;
      case 'revenue':
        // Revenue report
        chartData = {
          labels: ['Revenue'],
          values: [report.summary.revenue || 0]
        };
        break;
      case 'expense':
        // Expense report
        chartData = {
          labels: ['Expenses'],
          values: [report.summary.expenses || 0]
        };
        break;
      default:
        chartData = {
          labels: ['Data'],
          values: [report.summary.total || 0]
        };
    }

    // Calculate max value for chart scaling
    maxValue = Math.max(...chartData.values, 100); // Ensure minimum scale of 100
  }

  function initChart() {
    if (!chartContainer || !report) return;

    // Clear previous chart if exists
    if (chart) {
      chart.destroy();
    }

    // Create new chart
    chart = new Chart(chartContainer, {
      type: 'bar',
      data: {
        labels: chartData.labels,
        datasets: [{
          label: 'Report Data',
          data: chartData.values,
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
      },
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