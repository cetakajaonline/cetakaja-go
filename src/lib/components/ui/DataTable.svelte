<!-- src/lib/components/ui/DataTable.svelte -->
<script lang="ts">
  export let columns: string[] = [];
  export let data: Record<string, any>[] = [];
  export let actions: boolean = false;

  // optional: untuk tombol aksi seperti Edit/Delete
  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();
</script>

<div class="bg-base-100 rounded-lg shadow">
  <!-- Mobile Card Layout -->
  <div class="block sm:hidden">
    {#if data.length > 0}
      {#each data as row, i}
        <div class="p-4 border-b border-base-200 last:border-b-0">
          {#each columns as col, j}
            <div class="flex justify-between py-1">
              <span class="font-semibold text-base-content/70">{col}:</span>
              <span class="text-base-content">{row[col]}</span>
            </div>
          {/each}
          {#if actions}
            <div class="flex gap-2 mt-3 justify-end">
              <button class="btn btn-xs btn-info" on:click={() => dispatch('edit', row)}>Edit</button>
              <button class="btn btn-xs btn-error" on:click={() => dispatch('delete', row)}>Hapus</button>
            </div>
          {/if}
        </div>
      {/each}
    {:else}
      <div class="text-center py-8">
        <div class="text-lg">Tidak ada data ditemukan</div>
      </div>
    {/if}
  </div>
  
  <!-- Desktop Table Layout -->
  <div class="hidden sm:block overflow-x-auto">
    <table class="table table-zebra w-full">
      <thead>
        <tr>
          {#each columns as column}
            <th>{column}</th>
          {/each}
          {#if actions}
            <th class="text-right">Aksi</th>
          {/if}
        </tr>
      </thead>
      <tbody>
        {#each data as row}
          <tr>
            {#each columns as col}
              <td>{row[col]}</td>
            {/each}
            {#if actions}
              <td class="text-right">
                <div class="join">
                  <button class="btn btn-xs btn-outline btn-info join-item" on:click={() => dispatch('edit', row)}>Edit</button>
                  <button class="btn btn-xs btn-outline btn-error join-item" on:click={() => dispatch('delete', row)}>Hapus</button>
                </div>
              </td>
            {/if}
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</div>