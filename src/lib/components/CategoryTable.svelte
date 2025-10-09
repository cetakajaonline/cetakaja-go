<script lang="ts">
  import type { Category } from "$lib/types";
  import IconButton from "$lib/components/ui/IconButton.svelte";
  import { ChevronUp, ChevronDown, Pencil, Trash2 } from "lucide-svelte";

  export let categories: Category[] = [];
  export let onEdit: (category: Category) => void;
  export let onDelete: (category: Category) => void;

  export let sortKey: keyof Category = "name";
  export let sortDirection: "asc" | "desc" = "asc";
  export let onSort: (key: keyof Category) => void;

  export let isAdmin: boolean = false;
</script>

<div
  class="overflow-x-auto rounded-xl shadow border border-base-200 bg-base-100"
>
  <table class="table w-full min-w-[700px] text-sm">
    <thead class="bg-base-100 text-base-content">
      <tr>
        <th class="cursor-pointer" onclick={() => onSort("name")}>
          <div class="flex items-center gap-1">
            Nama
            {#if sortKey === "name"}
              {#if sortDirection === "asc"}
                <ChevronUp class="w-4 h-4 text-base-content/70" />
              {:else}
                <ChevronDown class="w-4 h-4 text-base-content/70" />
              {/if}
            {/if}
          </div>
        </th>

        <th class="cursor-pointer" onclick={() => onSort("code")}>
          <div class="flex items-center gap-1">
            Kode
            {#if sortKey === "code"}
              {#if sortDirection === "asc"}
                <ChevronUp class="w-4 h-4 text-base-content/70" />
              {:else}
                <ChevronDown class="w-4 h-4 text-base-content/70" />
              {/if}
            {/if}
          </div>
        </th>

        <th class="cursor-pointer" onclick={() => onSort("description")}>
          <div class="flex items-center gap-1">
            Deskripsi
            {#if sortKey === "description"}
              {#if sortDirection === "asc"}
                <ChevronUp class="w-4 h-4 text-base-content/70" />
              {:else}
                <ChevronDown class="w-4 h-4 text-base-content/70" />
              {/if}
            {/if}
          </div>
        </th>

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
