<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import Button from "$lib/components/ui/Button.svelte";
  import Input from "$lib/components/ui/Input.svelte";
  import type { ReportFilter } from "$lib/types";

  let {
    initialFilters,
    loading,
  }: {
    initialFilters?: Partial<ReportFilter>;
    loading: boolean;
  } = $props();

  const dispatch = createEventDispatcher();

  // Store dates as strings in 'YYYY-MM-DD' format for input fields
  let filters = $state<{
    startDate: string;
    endDate: string;
    reportType?: 'daily' | 'weekly' | 'monthly' | 'annual' | 'product' | 'customer' | 'revenue' | 'expense';
    productId?: number;
    userId?: number;
  }>({
    startDate: formatDateForInput(
      initialFilters?.startDate instanceof Date 
        ? initialFilters.startDate 
        : new Date(new Date().setDate(new Date().getDate() - 7))
    ),
    endDate: formatDateForInput(
      initialFilters?.endDate instanceof Date 
        ? initialFilters.endDate 
        : new Date()
    ),
    reportType: initialFilters?.reportType || "daily",
    productId: initialFilters?.productId ? Number(initialFilters?.productId) : undefined,
    userId: initialFilters?.userId ? Number(initialFilters?.userId) : undefined,
  });

  $effect(() => {
    if (initialFilters) {
      filters = {
        startDate: formatDateForInput(
          initialFilters.startDate instanceof Date 
            ? initialFilters.startDate 
            : new Date(initialFilters.startDate || new Date())
        ),
        endDate: formatDateForInput(
          initialFilters.endDate instanceof Date 
            ? initialFilters.endDate 
            : new Date(initialFilters.endDate || new Date())
        ),
        reportType: initialFilters.reportType,
        productId: initialFilters.productId ? Number(initialFilters.productId) : undefined,
        userId: initialFilters.userId ? Number(initialFilters.userId) : undefined,
      };
    }
  });

  function handleSubmit() {
    // Convert string input values to numbers for productId and userId
    // Handle the case where HTML number input might be an empty string
    const processedFilters = {
      ...filters,
      productId: (filters.productId !== undefined && filters.productId !== null && String(filters.productId) !== '') 
        ? Number(filters.productId) 
        : undefined,
      userId: (filters.userId !== undefined && filters.userId !== null && String(filters.userId) !== '') 
        ? Number(filters.userId) 
        : undefined
    };
    
    // Convert date strings to ISO format for validation
    const isoFilters = {
      ...processedFilters,
      startDate: convertDateToISO(processedFilters.startDate),
      endDate: convertDateToISO(processedFilters.endDate),
    };
    dispatch("applyFilters", isoFilters);
  }

  function handleReset() {
    filters = {
      startDate: formatDateForInput(new Date(new Date().setDate(new Date().getDate() - 7))),
      endDate: formatDateForInput(new Date()),
      reportType: "daily",
      productId: undefined,
      userId: undefined,
    };
    
    const processedFilters = {
      ...filters,
      productId: filters.productId ? Number(filters.productId) : undefined,
      userId: filters.userId ? Number(filters.userId) : undefined
    };
    
    const isoFilters = {
      ...processedFilters,
      startDate: convertDateToISO(processedFilters.startDate),
      endDate: convertDateToISO(processedFilters.endDate),
    };
    
    dispatch("applyFilters", isoFilters);
  }

  // Format date for input field (YYYY-MM-DD)
  function formatDateForInput(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  
  // Convert date string in 'YYYY-MM-DD' format to ISO datetime string
  function convertDateToISO(dateStr: string): string {
    const date = new Date(dateStr);
    // Set the time to the start of the day (00:00:00) in local time
    date.setHours(0, 0, 0, 0);
    return date.toISOString();
  }
</script>

<div class="card bg-base-100 shadow-md p-4">
  <form
    onsubmit={(event) => {
      event.preventDefault();
      handleSubmit();
    }}
    class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
  >
    <div class="form-control">
      <label class="label" for="startDate">
        <span class="label-text">Tanggal Awal</span>
      </label>
      <input
        id="startDate"
        type="date"
        class="input input-bordered w-full"
        bind:value={filters.startDate}
      />
    </div>

    <div class="form-control">
      <label class="label" for="endDate">
        <span class="label-text">Tanggal Akhir</span>
      </label>
      <input
        id="endDate"
        type="date"
        class="input input-bordered w-full"
        bind:value={filters.endDate}
      />
    </div>

    <div class="form-control">
      <label class="label" for="reportType">
        <span class="label-text">Jenis Laporan</span>
      </label>
      <select
        id="reportType"
        class="select select-bordered w-full"
        bind:value={filters.reportType}
      >
        <option value="daily">Harian</option>
        <option value="weekly">Mingguan</option>
        <option value="monthly">Bulanan</option>
        <option value="annual">Tahunan</option>
        <option value="product">Kinerja Produk</option>
        <option value="customer">Pelanggan</option>
        <option value="revenue">Pendapatan</option>
        <option value="expense">Pengeluaran</option>
      </select>
    </div>

    {#if filters.reportType === "product"}
      <div class="form-control">
        <label class="label" for="productId">
          <span class="label-text">Produk</span>
        </label>
        <input
          id="productId"
          type="number"
          class="input input-bordered w-full"
          bind:value={filters.productId}
          placeholder="ID Produk"
        />
      </div>
    {:else if filters.reportType === "customer"}
      <div class="form-control">
        <label class="label" for="userId">
          <span class="label-text">Pelanggan</span>
        </label>
        <input
          id="userId"
          type="number"
          class="input input-bordered w-full"
          bind:value={filters.userId}
          placeholder="ID Pelanggan"
        />
      </div>
    {/if}

    <div
      class="form-control md:col-span-2 lg:col-span-4 flex flex-row gap-2 pt-4"
    >
      <Button type="submit" className="btn-primary" {loading}>
        Terapkan Filter
      </Button>
      <Button type="button" className="btn-outline" onclick={handleReset}>
        Reset
      </Button>
    </div>
  </form>
</div>
