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

  function isProductReport(data: any): data is { totalProducts: number; totalSold: number; totalRevenue: number; products: any[] } {
    return data && 
           typeof data.totalProducts !== 'undefined' && 
           typeof data.totalSold !== 'undefined' && 
           typeof data.totalRevenue !== 'undefined' && 
           Array.isArray(data.products);
  }

  function isCustomerReport(data: any): data is { totalCustomers: number; totalOrders: number; totalRevenue: number; customers: any[] } {
    return data && 
           typeof data.totalCustomers !== 'undefined' && 
           typeof data.totalOrders !== 'undefined' && 
           typeof data.totalRevenue !== 'undefined' && 
           Array.isArray(data.customers);
  }

  function isRevenueReport(data: any): data is { totalRevenue: number; orders: any[] } {
    return data && 
           typeof data.totalRevenue !== 'undefined' && 
           Array.isArray(data.orders);
  }

  function isExpenseReport(data: any): data is { totalExpenses: number; expenses: any[] } {
    return data && 
           typeof data.totalExpenses !== 'undefined' && 
           Array.isArray(data.expenses);
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
            <span class="font-medium">{report.dateRange ? formatDate(report.dateRange.start) + ' - ' + formatDate(report.dateRange.end) : 'N/A'}</span>
          </div>
          <div class="flex justify-between">
            <span>Total:</span>
            <span class="font-medium">{report.summary ? report.summary.total : 'N/A'}</span>
          </div>
          <div class="flex justify-between">
            <span>Pendapatan:</span>
            <span class="font-medium text-success">{report.summary ? formatCurrency(report.summary.revenue) : formatCurrency(0)}</span>
          </div>
          <div class="flex justify-between">
            <span>Pengeluaran:</span>
            <span class="font-medium text-error">{report.summary ? formatCurrency(report.summary.expenses) : formatCurrency(0)}</span>
          </div>
          <div class="flex justify-between">
            <span>Laba Bersih:</span>
            <span class="font-medium {report.summary && report.summary.net >= 0 ? 'text-success' : 'text-error'}">
              {report.summary ? formatCurrency(report.summary.net) : formatCurrency(0)}
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
            {#if report.data && isProductReport(report.data)}
              <!-- All products report -->
              <div class="text-sm max-h-64 overflow-y-auto">
                <p>Total Produk: {report.data.totalProducts || 0}</p>
                <p>Total Terjual: {report.data.totalSold || 0}</p>
                <p>Total Pendapatan: {formatCurrency(report.data.totalRevenue || 0)}</p>
                {#if report.data.products && report.data.products.length > 0}
                  <div class="mt-2">
                    <h5 class="font-medium mb-1">Daftar Produk:</h5>
                    {#each report.data.products as product, i}
                      <div class="border-b pb-1 {i < report.data.products.length - 1 ? 'mb-2' : ''}">
                        <p>Produk: {product.name}</p>
                        <p>Terjual: {product.totalSold} | Pendapatan: {formatCurrency(product.totalRevenue)}</p>
                      </div>
                    {/each}
                  </div>
                {/if}
              </div>
            {/if}
          {:else if report.reportType === 'customer'}
            <!-- Customer Report -->
            {#if report.data && isCustomerReport(report.data)}
              <!-- All customers report -->
              <div class="text-sm max-h-64 overflow-y-auto">
                <p>Total Pelanggan: {report.data.totalCustomers || 0}</p>
                <p>Total Pesanan: {report.data.totalOrders || 0}</p>
                <p>Total Pendapatan: {formatCurrency(report.data.totalRevenue || 0)}</p>
                {#if report.data.customers && report.data.customers.length > 0}
                  <div class="mt-2">
                    <h5 class="font-medium mb-1">Daftar Pelanggan:</h5>
                    {#each report.data.customers as customer, i}
                      <div class="border-b pb-1 {i < report.data.customers.length - 1 ? 'mb-2' : ''}">
                        <p>Pelanggan: {customer.name}</p>
                        <p>Pesanan: {customer.totalOrders} | Dibelanjakan: {formatCurrency(customer.totalSpent)}</p>
                      </div>
                    {/each}
                  </div>
                {/if}
              </div>
            {/if}
          {:else if report.reportType === 'revenue'}
            <!-- Revenue Report -->
            {#if report.data && isRevenueReport(report.data)}
              <div class="text-sm">
                <p>Total Pendapatan: {formatCurrency(report.data.totalRevenue || 0)}</p>
                <p>Jumlah Transaksi: {report.data.orders?.length || 0}</p>
                {#if report.data.orders && report.data.orders.length > 0}
                  <div class="mt-2">
                    <h5 class="font-medium mb-1">Daftar Transaksi:</h5>
                    {#each report.data.orders as order, i}
                      <div class="border-b pb-1 {i < report.data.orders.length - 1 ? 'mb-2' : ''}">
                        <p>No. Transaksi: {order.orderNumber}</p>
                        <p>Tanggal: {formatDate(order.createdAt)} | Jumlah: {formatCurrency(order.totalAmount)}</p>
                      </div>
                    {/each}
                  </div>
                {/if}
              </div>
            {/if}
          {:else if report.reportType === 'expense'}
            <!-- Expense Report -->
            {#if report.data && isExpenseReport(report.data)}
              <div class="text-sm">
                <p>Total Pengeluaran: {formatCurrency(report.data.totalExpenses || 0)}</p>
                <p>Jumlah Transaksi: {report.data.expenses?.length || 0}</p>
                {#if report.data.expenses && report.data.expenses.length > 0}
                  <div class="mt-2">
                    <h5 class="font-medium mb-1">Daftar Pengeluaran:</h5>
                    {#each report.data.expenses as expense, i}
                      <div class="border-b pb-1 {i < report.data.expenses.length - 1 ? 'mb-2' : ''}">
                        <p>Kategori: {expense.category}</p>
                        <p>Tanggal: {formatDate(expense.date)} | Jumlah: {formatCurrency(expense.nominal)}</p>
                      </div>
                    {/each}
                  </div>
                {/if}
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