<script lang="ts">
  import type { User } from "$lib/types";
  import IconButton from "$lib/components/ui/IconButton.svelte";
  import { ChevronUp, ChevronDown, Pencil, Trash2 } from "lucide-svelte";

  export let users: User[] = [];
  // export let onRowClick: (user: User) => void; Pakai Buat Detail
  export let onEdit: (user: User) => void;
  export let onDelete: (user: User) => void;

  export let sortKey: keyof User = "name";
  export let sortDirection: "asc" | "desc" = "asc";
  export let onSort: (key: keyof User) => void;

  export let isAdmin: boolean = false;
  export let currentUserId: number = 0;
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

        <th class="cursor-pointer" onclick={() => onSort("username")}>
          <div class="flex items-center gap-1">
            Username
            {#if sortKey === "username"}
              {#if sortDirection === "asc"}
                <ChevronUp class="w-4 h-4 text-base-content/70" />
              {:else}
                <ChevronDown class="w-4 h-4 text-base-content/70" />
              {/if}
            {/if}
          </div>
        </th>

        <th class="cursor-pointer" onclick={() => onSort("phone")}>
          <div class="flex items-center gap-1">
            No. HP
            {#if sortKey === "phone"}
              {#if sortDirection === "asc"}
                <ChevronUp class="w-4 h-4 text-base-content/70" />
              {:else}
                <ChevronDown class="w-4 h-4 text-base-content/70" />
              {/if}
            {/if}
          </div>
        </th>

        <th class="cursor-pointer" onclick={() => onSort("address")}>
          <div class="flex items-center gap-1">
            Alamat
            {#if sortKey === "address"}
              {#if sortDirection === "asc"}
                <ChevronUp class="w-4 h-4 text-base-content/70" />
              {:else}
                <ChevronDown class="w-4 h-4 text-base-content/70" />
              {/if}
            {/if}
          </div>
        </th>

        <th class="cursor-pointer" onclick={() => onSort("role")}>
          <div class="flex items-center gap-1">
            Role
            {#if sortKey === "role"}
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
      {#each users as user}
        <!-- Pakai 
          on:click={() => onRowClick(user)} Buat Detail-->
        <tr class="hover:bg-base-100 transition cursor-pointer">
          <td>
            <div class="font-medium text-base-content">{user.name}</div>
          </td>

          <td>@{user.username}</td>

          <td>{user.phone}</td>

          <td>
            {#if user.address}
              <div class="max-w-[150px] truncate" title={user.address}>{user.address}</div>
            {:else}
              <span class="text-gray-400">-</span>
            {/if}
          </td>

          <td>
            <div
              class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize
                bg-base-200 text-base-content border border-base-300"
            >
              {user.role}
            </div>
          </td>

          <td class="text-right whitespace-nowrap">
            <div class="join">
              {#if isAdmin || user.id === currentUserId}
                <button 
                  class="btn btn-xs btn-outline btn-warning join-item"
                  onclick={() => onEdit(user)}
                >
                  Edit
                </button>
              {/if}

              {#if isAdmin}
                <button 
                  class="btn btn-xs btn-outline btn-error join-item"
                  onclick={() => onDelete(user)}
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

