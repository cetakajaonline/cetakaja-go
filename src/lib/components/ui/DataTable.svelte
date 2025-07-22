<!-- src/lib/components/ui/DataTable.svelte -->
<script lang="ts">
  export let columns: string[] = [];
  export let data: Record<string, any>[] = [];
  export let actions: boolean = false;

  // optional: untuk tombol aksi seperti Edit/Delete
  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();
</script>

<div class="overflow-x-auto">
  <table class="table table-zebra w-full">
    <thead>
      <tr>
        {#each columns as column}
          <th>{column}</th>
        {/each}
        {#if actions}
          <th>Aksi</th>
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
            <td class="flex gap-2">
              <button class="btn btn-xs btn-info" on:click={() => dispatch('edit', row)}>Edit</button>
              <button class="btn btn-xs btn-error" on:click={() => dispatch('delete', row)}>Hapus</button>
            </td>
          {/if}
        </tr>
      {/each}
    </tbody>
  </table>
</div>
