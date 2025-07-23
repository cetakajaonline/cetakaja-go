<script lang="ts">
  import type { Item } from '$lib/types';
  import IconButton from '$lib/components/ui/IconButton.svelte';
  import { ChevronUp, ChevronDown, Pencil, Trash2 } from 'lucide-svelte';

  export let items: Item[] = [];
  export let onEdit: (item: Item) => void;
  export let onDelete: (item: Item) => void;

  export let sortKey: keyof Item = 'createdAt';
  export let sortDirection: 'asc' | 'desc' = 'desc';
  export let onSort: (key: keyof Item) => void;
</script>

<div class="overflow-x-auto rounded-xl shadow border border-base-200 bg-base-100">
  <table class="table w-full text-sm">
    <thead class="bg-base-100 text-base-content">
      <tr>
        <th class="cursor-pointer" on:click={() => onSort('name')}>
          <div class="flex items-center gap-1">
            Nama Item
            {#if sortKey === 'name'}
              {#if sortDirection === 'asc'}
                <ChevronUp class="w-4 h-4 text-base-content/70" />
              {:else}
                <ChevronDown class="w-4 h-4 text-base-content/70" />
              {/if}
            {/if}
          </div>
        </th>
        <th class="cursor-pointer" on:click={() => onSort('desc')}>
          <div class="flex items-center gap-1">
            Deskripsi
            {#if sortKey === 'desc'}
              {#if sortDirection === 'asc'}
                <ChevronUp class="w-4 h-4 text-base-content/70" />
              {:else}
                <ChevronDown class="w-4 h-4 text-base-content/70" />
              {/if}
            {/if}
          </div>
        </th>
        <th class="cursor-pointer" on:click={() => onSort('createdAt')}>
          <div class="flex items-center gap-1">
            Tanggal Dibuat
            {#if sortKey === 'createdAt'}
              {#if sortDirection === 'asc'}
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
      {#each items as item}
        <tr class="hover:bg-base-100 transition">
          <td class="font-medium text-base-content">{item.name}</td>
          <td class="break-all text-base-content/80">{item.desc}</td>
          <td class="text-xs text-base-content/70">
            {new Date(item.createdAt).toLocaleDateString('id-ID', {
              day: '2-digit',
              month: 'short',
              year: 'numeric'
            })}
          </td>
          <td class="text-right space-x-2">
            <IconButton icon={Pencil} color="btn-circle btn-outline btn-success" onClick={() => onEdit(item)} />
            <IconButton icon={Trash2} color="btn-circle btn-outline btn-error" onClick={() => onDelete(item)} />
          </td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>
