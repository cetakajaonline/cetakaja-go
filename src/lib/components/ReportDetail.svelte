<script lang="ts">
  import { onMount } from 'svelte';
  import type { ReportResponse } from '$lib/types';
  import Button from '$lib/components/ui/Button.svelte';

  let { report, loading, exportReport }: { 
    report: ReportResponse | null; 
    loading: boolean;
    exportReport: (format: 'pdf' | 'xlsx' | 'csv') => Promise<void>;
  } = $props();

  // Format currency for Indonesian Rupiah
  function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  }

  // Format date
  function formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  }

  // Type guard functions to safely check report data types
  function isDailyWeeklyMonthlyAnnualReport(data: any): data is { totalOrders: number; totalRevenue: number; totalExpenses: number; netRevenue: number } {
    return data && 
           typeof data.totalOrders !== 'undefined' && 
           typeof data.totalRevenue !== 'undefined' && 
           typeof data.totalExpenses !== 'undefined' && 
           typeof data.netRevenue !== 'undefined';
  }

  function isProductReportIndividual(data: any): data is { productId?: number; productName?: string; totalSold?: number; totalRevenue?: number } {
    return data && typeof data.productId !== 'undefined'; // Check for individual product report
  }

  function isProductReportAll(data: any): data is { totalProducts?: number; totalSold?: number; totalRevenue?: number; products?: any[] } {
    return Array.isArray(data); // Check if it's an array of products
  }

  function isCustomerReportIndividual(data: any): data is { userId?: number; customerName?: string; totalOrders?: number; totalSpent?: number } {
    return data && typeof data.userId !== 'undefined'; // Check for individual customer report
  }

  function isCustomerReportAll(data: any): data is { totalCustomers?: number; totalOrders?: number; totalRevenue?: number; customers?: any[] } {
    return Array.isArray(data); // Check if it's an array of customers
  }

  function isRevenueReportIndividual(data: any): data is { totalRevenue?: number; orders?: any[] } {
    return data && typeof data.totalRevenue !== 'undefined' && !Array.isArray(data);
  }

  function isRevenueReportAll(data: any): data is { totalRevenue?: number; orders?: any[] }[] {
    return Array.isArray(data); // Check if it's an array of revenue reports
  }

  function isExpenseReportIndividual(data: any): data is { totalExpenses?: number; expenses?: any[] } {
    return data && typeof data.totalExpenses !== 'undefined' && !Array.isArray(data);
  }

  function isExpenseReportAll(data: any): data is { totalExpenses?: number; expenses?: any[] }[] {
    return Array.isArray(data); // Check if it's an array of expense reports
  }
</script>

<div class="card bg-base-100 shadow-md p-4">
  <div class="flex justify-between items-center mb-4">
    <h3 class="text-lg font-semibold">Detail Laporan</h3>
    <div class="flex gap-2">
      <Button className="btn-sm" onclick={() => exportReport('pdf')}>PDF</Button>
      <Button className="btn-sm" onclick={() => exportReport('xlsx')}>Excel</Button>
      <Button className="btn-sm" onclick={() => exportReport('csv')}>CSV</Button>
    </div>
  </div>
  
  {#if loading}
    <div class="flex justify-center items-center h-40">
      <span class="loading loading-spinner loading-md"></span>
    </div>
  {:else if report}
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <!-- Report Summary -->
      <div class="card bg-base-200 p-4">
        <h4 class="font-semibold mb-2">Ringkasan</h4>
        <div class="space-y-2">
          <div class="flex justify-between">
            <span>Jenis Laporan:</span>
            <span class="font-medium capitalize">{report.reportType}</span>
          </div>
          <div class="flex justify-between">
            <span>Periode:</span>
            <span class="font-medium">{formatDate(report.dateRange.start)} - {formatDate(report.dateRange.end)}</span>
          </div>
          <div class="flex justify-between">
            <span>Total:</span>
            <span class="font-medium">{report.summary.total}</span>
          </div>
          <div class="flex justify-between">
            <span>Pendapatan:</span>
            <span class="font-medium text-success">{formatCurrency(report.summary.revenue)}</span>
          </div>
          <div class="flex justify-between">
            <span>Pengeluaran:</span>
            <span class="font-medium text-error">{formatCurrency(report.summary.expenses)}</span>
          </div>
          <div class="flex justify-between">
            <span>Laba Bersih:</span>
            <span class="font-medium {report.summary.net >= 0 ? 'text-success' : 'text-error'}">
              {formatCurrency(report.summary.net)}
            </span>
          </div>
        </div>
      </div>

      <!-- Report Data -->
      <div class="card bg-base-200 p-4">
        <h4 class="font-semibold mb-2">Data Laporan</h4>
        <div class="overflow-x-auto">
          {#if report.reportType === 'daily' || report.reportType === 'weekly' || report.reportType === 'monthly' || report.reportType === 'annual'}
            <!-- Orders Summary for date-based reports -->
            {#if report.data && isDailyWeeklyMonthlyAnnualReport(report.data)}
              <div class="text-sm">
                <p>Jumlah Pesanan: {report.data.totalOrders || 0}</p>
                <p>Pendapatan: {formatCurrency(report.data.totalRevenue || 0)}</p>
                <p>Pengeluaran: {formatCurrency(report.data.totalExpenses || 0)}</p>
                <p>Laba Bersih: {formatCurrency(report.data.netRevenue || 0)}</p>
              </div>
            {/if}
          {:else if report.reportType === 'product'}
            <!-- Product Performance -->
            {#if report.data && isProductReportAll(report.data)}
              <!-- All products report -->
              <div class="text-sm max-h-64 overflow-y-auto">
                {#if (report.data as any[])[0]?.totalProducts !== undefined}
                  <p>Total Produk: {(report.data as any[])[0].totalProducts || 0}</p>
                  <p>Total Terjual: {(report.data as any[])[0].totalSold || 0}</p>
                  <p>Total Pendapatan: {formatCurrency((report.data as any[])[0].totalRevenue || 0)}</p>
                {/if}
                {#if (report.data as any[])[0] && (report.data as any[])[0].products && (report.data as any[])[0].products.length > 0}
                  <div class="mt-2">
                    <h5 class="font-medium mb-1">Daftar Produk:</h5>
                    {#each (report.data as any[])[0].products as product, i}
                      <div class="border-b pb-1 {i < (report.data as any[])[0].products.length - 1 ? 'mb-2' : ''}">
                        <p>Produk: {product.productName}</p>
                        <p>Terjual: {product.totalSold} | Pendapatan: {formatCurrency(product.totalRevenue)}</p>
                      </div>
                    {/each}
                  </div>
                {/if}
              </div>
            {:else if report.data && isProductReportIndividual(report.data)}
              <!-- Individual product report -->
              <div class="text-sm">
                <p>Produk: {report.data.productName}</p>
                <p>Total Terjual: {report.data.totalSold || 0}</p>
                <p>Total Pendapatan: {formatCurrency(report.data.totalRevenue || 0)}</p>
              </div>
            {/if}
          {:else if report.reportType === 'customer'}
            <!-- Customer Report -->
            {#if report.data && isCustomerReportAll(report.data)}
              <!-- All customers report -->
              <div class="text-sm max-h-64 overflow-y-auto">
                {#if (report.data as any[])[0]?.totalCustomers !== undefined}
                  <p>Total Pelanggan: {(report.data as any[])[0].totalCustomers || 0}</p>
                  <p>Total Pesanan: {(report.data as any[])[0].totalOrders || 0}</p>
                  <p>Total Pendapatan: {formatCurrency((report.data as any[])[0].totalRevenue || 0)}</p>
                {/if}
                {#if (report.data as any[])[0] && (report.data as any[])[0].customers && (report.data as any[])[0].customers.length > 0}
                  <div class="mt-2">
                    <h5 class="font-medium mb-1">Daftar Pelanggan:</h5>
                    {#each (report.data as any[])[0].customers as customer, i}
                      <div class="border-b pb-1 {i < (report.data as any[])[0].customers.length - 1 ? 'mb-2' : ''}">
                        <p>Pelanggan: {customer.customerName}</p>
                        <p>Pesanan: {customer.totalOrders} | Dibelanjakan: {formatCurrency(customer.totalSpent)}</p>
                      </div>
                    {/each}
                  </div>
                {/if}
              </div>
            {:else if report.data && isCustomerReportIndividual(report.data)}
              <!-- Individual customer report -->
              <div class="text-sm">
                <p>Pelanggan: {report.data.customerName}</p>
                <p>Total Pesanan: {report.data.totalOrders || 0}</p>
                <p>Total Dibelanjakan: {formatCurrency(report.data.totalSpent || 0)}</p>
              </div>
            {/if}
          {:else if report.reportType === 'revenue'}
            <!-- Revenue Report -->
            {#if report.data && isRevenueReportAll(report.data)}
              {#if (report.data as any[])[0]?.totalRevenue !== undefined}
                <div class="text-sm">
                  <p>Total Pendapatan: {formatCurrency((report.data as any[])[0].totalRevenue || 0)}</p>
                  <p>Jumlah Transaksi: {(report.data as any[])[0].orders?.length || 0}</p>
                </div>
              {/if}
            {:else if report.data && isRevenueReportIndividual(report.data)}
              <div class="text-sm">
                <p>Total Pendapatan: {formatCurrency(report.data.totalRevenue || 0)}</p>
                <p>Jumlah Transaksi: {report.data.orders?.length || 0}</p>
              </div>
            {/if}
          {:else if report.reportType === 'expense'}
            <!-- Expense Report -->
            {#if report.data && isExpenseReportAll(report.data)}
              {#if (report.data as any[])[0]?.totalExpenses !== undefined}
                <div class="text-sm">
                  <p>Total Pengeluaran: {formatCurrency((report.data as any[])[0].totalExpenses || 0)}</p>
                  <p>Jumlah Transaksi: {(report.data as any[])[0].expenses?.length || 0}</p>
                </div>
              {/if}
            {:else if report.data && isExpenseReportIndividual(report.data)}
              <div class="text-sm">
                <p>Total Pengeluaran: {formatCurrency(report.data.totalExpenses || 0)}</p>
                <p>Jumlah Transaksi: {report.data.expenses?.length || 0}</p>
              </div>
            {/if}
          {:else}
            <p>Data tidak tersedia untuk jenis laporan ini</p>
          {/if}
        </div>
      </div>
    </div>
  {:else}
    <div class="text-center py-8 text-gray-500">
      <p>Silakan pilih laporan untuk melihat detail</p>
    </div>
  {/if}
</div>