<script lang="ts">
  import type { User } from '$lib/types';
  import IconButton from '$lib/components/ui/IconButton.svelte';
  import { ChevronUp, ChevronDown, Pencil, Trash2 } from 'lucide-svelte';

  export let users: User[] = [];
  // export let onRowClick: (user: User) => void; Pakai Buat Detail
  export let onEdit: (user: User) => void;
  export let onDelete: (user: User) => void;

  export let sortKey: keyof User = 'name';
  export let sortDirection: 'asc' | 'desc' = 'asc';
  export let onSort: (key: keyof User) => void;
</script>

<div class="overflow-x-auto rounded-xl shadow border border-base-200 bg-base-100">
  <table class="table w-full text-sm">
    <thead class="bg-base-100 text-base-content">
      <tr>
        <th class="cursor-pointer" on:click={() => onSort('name')}>
          <div class="flex items-center gap-1">
            Nama
            {#if sortKey === 'name'}
              {#if sortDirection === 'asc'}
                <ChevronUp class="w-4 h-4 text-base-content/70" />
              {:else}
                <ChevronDown class="w-4 h-4 text-base-content/70" />
              {/if}
            {/if}
          </div>
        </th>

        <th class="cursor-pointer" on:click={() => onSort('email')}>
          <div class="flex items-center gap-1">
            Email
            {#if sortKey === 'email'}
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
      {#each users as user}
        <!-- Pakai 
          on:click={() => onRowClick(user)} Buat Detail-->
        <tr
          class="hover:bg-base-100 transition cursor-pointer"
        >
          <td>
            <div class="flex items-center gap-3">
              <div class="avatar">
                <div class="w-10 h-10 rounded-full ring ring-base-300 ring-offset-1">
                  <img src={user.photo || '/uploads/placeholder.png'} alt={user.name} />
                </div>
              </div>
              <div>
                <div class="font-medium text-base-content">{user.name}</div>
              </div>
            </div>
          </td>
          <td>{user.email}</td>
          <td class="text-right space-x-2">
            <IconButton icon={Pencil} color="btn-circle btn-outline btn-success" onClick={() => onEdit(user)} />
            <IconButton icon={Trash2} color="btn-circle btn-outline btn-error" onClick={() => onDelete(user)} />
          </td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>
