<script lang="ts">
  import { onMount } from 'svelte';
  import type { ReportResponse } from '$lib/types';

  let { report, loading }: { report: ReportResponse | null; loading: boolean } = $props();
  let chartContainer: HTMLDivElement;
  
  // Chart.js is not included by default in SvelteKit
  // For now, we'll create a simple bar chart with HTML/CSS
  // In a real app, you would import Chart.js here
  
  // Sample chart data based on report type
  let chartData: { labels: string[]; values: number[] } = $state({ labels: [], values: [] });
  let maxValue: number = $state(0);

  $effect(() => {
    if (report) {
      processReportData();
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
        if (report.data?.productId) {
          // Individual product report
          chartData = {
            labels: ['Items Sold', 'Revenue'],
            values: [report.summary.total || 0, report.summary.revenue || 0]
          };
        } else {
          // All products report - use total products, total sold, total revenue
          chartData = {
            labels: ['Total Products', 'Total Sold', 'Total Revenue'],
            values: [
              report.data?.totalProducts || 0,
              report.data?.totalSold || 0,
              report.data?.totalRevenue || 0
            ]
          };
        }
        break;
      case 'customer':
        // Customer report - check if it's individual or all customers
        if (report.data?.userId) {
          // Individual customer report
          chartData = {
            labels: ['Orders Count', 'Total Spent'],
            values: [report.summary.total || 0, report.summary.revenue || 0]
          };
        } else {
          // All customers report - use total customers, total orders, total revenue
          chartData = {
            labels: ['Total Customers', 'Total Orders', 'Total Revenue'],
            values: [
              report.data?.totalCustomers || 0,
              report.data?.totalOrders || 0,
              report.data?.totalRevenue || 0
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
</script>

<div class="card bg-base-100 shadow-md p-4">
  <h3 class="text-lg font-semibold mb-4">Grafik Laporan</h3>
  
  {#if loading}
    <div class="flex justify-center items-center h-40">
      <span class="loading loading-spinner loading-md"></span>
    </div>
  {:else if report}
    <div class="chart-container">
      {#if chartData.labels.length > 0}
        <div class="flex flex-col space-y-4">
          {#each chartData.labels as label, i}
            <div class="flex flex-col">
              <div class="flex justify-between mb-1">
                <span class="text-sm font-medium">{label}</span>
                <span class="text-sm font-medium">
                  {#if report.reportType === 'revenue' || report.reportType === 'expense' || report.reportType === 'product' || report.reportType === 'customer'}
                    Rp {chartData.values[i].toLocaleString('id-ID')}
                  {:else}
                    {chartData.values[i]}
                  {/if}
                </span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  class="bg-primary h-2.5 rounded-full" 
                  style="width: {Math.max(5, (chartData.values[i] / maxValue) * 100)}%"
                ></div>
              </div>
            </div>
          {/each}
        </div>
      {:else}
        <div class="text-center py-8 text-gray-500">
          <p>Data grafik tidak tersedia untuk jenis laporan ini</p>
        </div>
      {/if}
    </div>
  {:else}
    <div class="text-center py-8 text-gray-500">
      <p>Silakan pilih laporan untuk melihat grafik</p>
    </div>
  {/if}
</div>