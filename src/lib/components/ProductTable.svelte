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

<div class="rounded-xl shadow border border-base-200 bg-base-100">
  <!-- Mobile Card Layout -->
  <div class="block sm:hidden">
    {#if products.length > 0}
      {#each products as product}
        <div class="p-4">
          <div class="flex items-center gap-3 mb-3">
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
              <div class="font-bold text-base-content text-lg">{product.name}</div>
              <div class="text-sm opacity-70">{product.baseCode}</div>
            </div>
          </div>
          
          <div class="space-y-2 mb-4">
            <div class="flex">
              <div class="w-2/5 font-semibold">Kategori:</div>
              <div class="w-3/5 text-right">
                <span class="badge badge-ghost badge-sm">{product.category?.name}</span>
              </div>
            </div>
            
            <div class="flex">
              <div class="w-2/5 font-semibold">Varian & Harga:</div>
              <div class="w-3/5 text-right">
                {#each product.variants as variant}
                  <div class="text-sm">
                    <span class="font-medium">{variant.variantName}:</span>
                    <span class="ml-1 text-success font-medium">{formatCurrency(variant.price)}</span>
                  </div>
                {/each}
              </div>
            </div>
            
            <div class="flex">
              <div class="w-2/5 font-semibold">Dibuat:</div>
              <div class="w-3/5 text-right">
                {new Date(product.createdAt).toLocaleDateString()}
              </div>
            </div>
            
            {#if product.description}
              <div class="flex">
                <div class="w-2/5 font-semibold">Deskripsi:</div>
                <div class="w-3/5 text-right text-sm text-base-content/70">
                  {product.description}
                </div>
              </div>
            {/if}
          </div>
          
          <!-- Actions at the bottom -->
          <div class="flex mt-4">
            <div class="join w-full">
              {#if isAdmin}
                <button 
                  class="btn btn-sm btn-outline btn-warning join-item flex-1"
                  onclick={() => onEdit(product)}
                >
                  Edit
                </button>
                <button 
                  class="btn btn-sm btn-outline btn-error join-item flex-1"
                  onclick={() => onDelete(product)}
                >
                  Hapus
                </button>
              {/if}
            </div>
          </div>
        </div>
      {/each}
    {:else}
      <div class="text-center py-8">
        <div class="text-lg">Tidak ada produk ditemukan</div>
      </div>
    {/if}
  </div>
  
  <!-- Desktop Table Layout -->
  <div class="hidden sm:block overflow-x-auto max-w-full">
    <table class="table w-full text-sm">
      <thead class="bg-base-100 text-base-content">
        <tr>
          <th class="cursor-pointer" onclick={() => onSort("name")}>
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

          <th class="cursor-pointer" onclick={() => onSort("baseCode")}>
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

          <th class="cursor-pointer" onclick={() => onSort("category.name")}>
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

          <th class="cursor-pointer" onclick={() => onSort("createdAt")}>
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

            <td class="text-right whitespace-nowrap">
              <div class="join">
                {#if isAdmin}
                  <button 
                    class="btn btn-xs btn-outline btn-warning join-item"
                    onclick={() => onEdit(product)}
                  >
                    Edit
                  </button>
                  <button 
                    class="btn btn-xs btn-outline btn-error join-item"
                    onclick={() => onDelete(product)}
                  >
                    Hapus
                  </button>
                {/if}
              </div>
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</div>
