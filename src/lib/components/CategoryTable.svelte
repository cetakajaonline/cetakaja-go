<script lang="ts">
  import type { Category } from "$lib/types";
  import IconButton from "$lib/components/ui/IconButton.svelte";

  export let categories: Category[] = [];
  export let onEdit: (category: Category) => void;
  export let onDelete: (category: Category) => void;

  export let sortKey: keyof Category = "name";
  export let sortDirection: "asc" | "desc" = "asc";
  export let onSort: (key: keyof Category) => void;

  export let isAdmin: boolean = false;
</script>

<div class="rounded-xl shadow border border-base-200 bg-base-100">
  <!-- Mobile Card Layout -->
  <div class="block sm:hidden">
    {#if categories.length > 0}
      {#each categories as category}
        <div class="p-4">
          <div class="font-bold text-base-content text-lg mb-2">{category.name}</div>
          <div class="text-sm opacity-70 mb-3">{category.code}</div>
          
          <div class="space-y-2 mb-4">
            <div class="flex">
              <div class="w-2/5 font-semibold">Deskripsi:</div>
              <div class="w-3/5 text-right">
                {#if category.description}
                  {category.description}
                {:else}
                  <span class="text-gray-400">-</span>
                {/if}
              </div>
            </div>
            
            <div class="flex">
              <div class="w-2/5 font-semibold">Dibuat:</div>
              <div class="w-3/5 text-right">
                {#if category.createdAt}
                  {#if typeof category.createdAt === 'string'}
                    {new Date(category.createdAt).toLocaleDateString()}
                  {:else if category.createdAt instanceof Date}
                    {category.createdAt.toLocaleDateString()}
                  {/if}
                {/if}
              </div>
            </div>
          </div>
          
          <!-- Actions at the bottom -->
          <div class="flex mt-4">
            <div class="join w-full">
              {#if isAdmin}
                <button 
                  class="btn btn-sm btn-outline btn-warning join-item flex-1"
                  onclick={() => onEdit(category)}
                >
                  Edit
                </button>
                <button 
                  class="btn btn-sm btn-outline btn-error join-item flex-1"
                  onclick={() => onDelete(category)}
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
        <div class="text-lg">Tidak ada kategori ditemukan</div>
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
              Nama
              {#if sortKey === "name"}
                {#if sortDirection === "asc"} ↑ {:else} ↓ {/if}
              {/if}
            </div>
          </th>

          <th class="cursor-pointer" onclick={() => onSort("code")}>
            <div class="flex items-center gap-1">
              Kode
              {#if sortKey === "code"}
                {#if sortDirection === "asc"} ↑ {:else} ↓ {/if}
              {/if}
            </div>
          </th>

          <th class="cursor-pointer" onclick={() => onSort("description")}>
            <div class="flex items-center gap-1">
              Deskripsi
              {#if sortKey === "description"}
                {#if sortDirection === "asc"} ↑ {:else} ↓ {/if}
              {/if}
            </div>
          </th>

          <th class="cursor-pointer" onclick={() => onSort("createdAt")}>
            <div class="flex items-center gap-1">
              Dibuat
              {#if sortKey === "createdAt"}
                {#if sortDirection === "asc"} ↑ {:else} ↓ {/if}
              {/if}
            </div>
          </th>

          <th class="text-right pr-4">Aksi</th>
        </tr>
      </thead>
      <tbody>
        {#each categories as category}
          <tr class="hover:bg-base-100 transition cursor-pointer">
            <td>
              <div class="font-medium text-base-content">{category.name}</div>
            </td>

            <td>{category.code}</td>

            <td>
              {#if category.description}
                <div class="max-w-[200px] truncate" title={category.description}>{category.description}</div>
              {:else}
                <span class="text-gray-400">-</span>
              {/if}
            </td>

            <td>
              {#if category.createdAt}
                {#if typeof category.createdAt === 'string'}
                  {new Date(category.createdAt).toLocaleDateString()}
                {:else if category.createdAt instanceof Date}
                  {category.createdAt.toLocaleDateString()}
                {/if}
              {/if}
            </td>

            <td class="text-right whitespace-nowrap">
              <div class="join">
                {#if isAdmin}
                  <button 
                    class="btn btn-xs btn-outline btn-warning join-item"
                    onclick={() => onEdit(category)}
                  >
                    Edit
                  </button>
                  <button 
                    class="btn btn-xs btn-outline btn-error join-item"
                    onclick={() => onDelete(category)}
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
