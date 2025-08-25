<script lang="ts">
  import type { Token } from "$lib/types";
  import IconButton from "$lib/components/ui/IconButton.svelte";
  import {
    ChevronUp,
    ChevronDown,
    Pencil,
    Trash2,
    CheckCircle,
    XCircle,
  } from "lucide-svelte";

  export let tokens: Token[] = [];
  export let onEdit: (token: Token) => void;
  export let onDelete: (token: Token) => void;

  export let sortKey: keyof Token = "createdAt";
  export let sortDirection: "asc" | "desc" = "desc";
  export let onSort: (key: keyof Token) => void;
</script>

<div
  class="overflow-x-auto rounded-xl shadow border border-base-200 bg-base-100"
>
  <table class="table w-full min-w-[700px] text-sm">
    <thead class="bg-base-100 text-base-content">
      <tr>
        <th> Pengguna </th>
        <th class="cursor-pointer" on:click={() => onSort("name")}>
          <div class="flex items-center gap-1">
            Nama Token
            {#if sortKey === "name"}
              {#if sortDirection === "asc"}
                <ChevronUp class="w-4 h-4 text-base-content/70" />
              {:else}
                <ChevronDown class="w-4 h-4 text-base-content/70" />
              {/if}
            {/if}
          </div>
        </th>
        <th class="cursor-pointer" on:click={() => onSort("token")}>
          <div class="flex items-center gap-1">
            Kode Token
            {#if sortKey === "token"}
              {#if sortDirection === "asc"}
                <ChevronUp class="w-4 h-4 text-base-content/70" />
              {:else}
                <ChevronDown class="w-4 h-4 text-base-content/70" />
              {/if}
            {/if}
          </div>
        </th>
        <th class="cursor-pointer" on:click={() => onSort("revoked")}>
          <div class="flex items-center gap-1">
            Status
            {#if sortKey === "revoked"}
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
      {#each tokens as token}
        <tr class="hover:bg-base-100 transition">
          <!-- Pengguna -->
          <td>
            <div class="flex items-center gap-3">
              <div class="avatar">
                <div
                  class="w-10 h-10 rounded-full ring ring-base-300 ring-offset-1"
                >
                  <img
                    src={token.creator?.photo || "/uploads/placeholder.png"}
                    alt={token.creator?.name || "User"}
                  />
                </div>
              </div>
              <div>
                <div class="font-medium text-base-content">
                  {token.creator?.name || "-"}
                </div>
                <div class="text-xs text-base-content/70">
                  {token.creator?.email || "-"}
                </div>
              </div>
            </div>
          </td>

          <!-- Nama Token -->
          <td>{token.name}</td>

          <!-- Kode Token -->
          <td class="break-all">{token.token}</td>

          <!-- Status Token -->
          <td>
            {#if token.revoked}
              <div class="flex items-center gap-1 text-error">
                <XCircle class="w-4 h-4" />
                <span class="text-xs">Nonaktif</span>
              </div>
            {:else}
              <div class="flex items-center gap-1 text-success">
                <CheckCircle class="w-4 h-4" />
                <span class="text-xs">Aktif</span>
              </div>
            {/if}
          </td>

          <!-- Aksi -->
          <td class="text-right space-x-2 whitespace-nowrap">
            <IconButton
              icon={Pencil}
              color="btn-circle btn-outline btn-success"
              onClick={() => onEdit(token)}
            />
            <IconButton
              icon={Trash2}
              color="btn-circle btn-outline btn-error"
              onClick={() => onDelete(token)}
            />
          </td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>
