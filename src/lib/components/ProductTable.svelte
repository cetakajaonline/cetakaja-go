<script lang="ts">
  import type { Product } from "$lib/types";
  import IconButton from "$lib/components/ui/IconButton.svelte";
  import { ChevronUp, ChevronDown, Pencil, Trash2 } from "lucide-svelte";

  export let products: Product[] = [];
  export let onEdit: (product: Product) => void;
  export let onDelete: (product: Product) => void;

  import type { ProductSortKey } from "$lib/types";

  export let sortKey: ProductSortKey = "name";
  export let sortDirection: "asc" | "desc" = "asc";
  export let onSort: (key: ProductSortKey) => void;

  export let isAdmin: boolean = false;

  // Helper function to format currency
  function formatCurrency(price: number): string {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price);
  }
</script>

<div
  class="overflow-x-auto rounded-xl shadow border border-base-200 bg-base-100"
>
  <table class="table w-full min-w-[800px] text-sm">
    <thead class="bg-base-100 text-base-content">
      <tr>
        <th class="cursor-pointer" on:click={() => onSort("name")}>
          <div class="flex items-center gap-1">
            Produk
            {#if sortKey === "name"}
              {#if sortDirection === "asc"}
                <ChevronUp class="w-4 h-4 text-base-content/70" />
              {:else}
                <ChevronDown class="w-4 h-4 text-base-content/70" />
              {/if}
            {/if}
          </div>
        </th>

        <th class="cursor-pointer" on:click={() => onSort("baseCode")}>
          <div class="flex items-center gap-1">
            Kode Produk
            {#if sortKey === "baseCode"}
              {#if sortDirection === "asc"}
                <ChevronUp class="w-4 h-4 text-base-content/70" />
              {:else}
                <ChevronDown class="w-4 h-4 text-base-content/70" />
              {/if}
            {/if}
          </div>
        </th>

        <th class="cursor-pointer" on:click={() => onSort("category.name")}>
          <div class="flex items-center gap-1">
            Kategori
            {#if sortKey === "category.name"}
              {#if sortDirection === "asc"}
                <ChevronUp class="w-4 h-4 text-base-content/70" />
              {:else}
                <ChevronDown class="w-4 h-4 text-base-content/70" />
              {/if}
            {/if}
          </div>
        </th>

        <th>Varian & Harga</th>

        <th class="cursor-pointer" on:click={() => onSort("createdAt")}>
          <div class="flex items-center gap-1">
            Dibuat
            {#if sortKey === "createdAt"}
              {#if sortDirection === "asc"}
                <ChevronUp class="w-4 h-4 text-base-content/70" />
              {:else}
                <ChevronDown class="w-4 h-4 text-base-content/70" />
              {/if}
            {/if}
          </div>
        </th>

        <th class="text-right pr-4">Aksi</th>
      </tr>
    </thead>
    <tbody>
      {#each products as product}
        <tr class="hover:bg-base-100 transition cursor-pointer">
          <td>
            <div class="flex items-center gap-3">
              <div class="avatar">
                <div class="w-12 h-12 rounded">
                  <img 
                    src={product.photo || "/uploads/logo.png"} 
                    alt={product.name}
                    class="object-cover w-full h-full"
                  />
                </div>
              </div>
              <div>
                <div class="font-medium text-base-content">{product.name}</div>
                {#if product.description}
                  <div class="text-xs text-base-content/70 truncate max-w-xs">{product.description}</div>
                {/if}
              </div>
            </div>
          </td>

          <td>{product.baseCode}</td>

          <td>
            <span class="badge badge-ghost badge-sm">{product.category?.name}</span>
          </td>

          <td>
            {#each product.variants as variant}
              <div class="text-sm">
                <span class="font-medium">{variant.variantName}:</span>
                <span class="ml-1 text-success font-medium">{formatCurrency(variant.price)}</span>
              </div>
            {/each}
          </td>

          <td>{new Date(product.createdAt).toLocaleDateString()}</td>

          <td class="text-right space-x-2 whitespace-nowrap">
            {#if isAdmin}
              <IconButton
                icon={Pencil}
                color="btn-circle btn-outline btn-success"
                onClick={() => onEdit(product)}
              />
              <IconButton
                icon={Trash2}
                color="btn-circle btn-outline btn-error"
                onClick={() => onDelete(product)}
              />
            {/if}
          </td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>