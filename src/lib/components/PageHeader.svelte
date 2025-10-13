<script lang="ts">
  export let title: string;
  export let icon: string = '';
  export let showAddButton: boolean = false;
  export let addLabel: string = 'Tambah';
  export let onAdd: () => void = () => {};
</script>

<div class="flex justify-between items-center mb-6">
  <h1 class="text-xl font-semibold text-base-content">
    {#if icon}
      <span class="mr-2">{icon}</span>
    {/if}
    {title}
  </h1>

  {#if showAddButton}
    <button on:click={onAdd} class="btn btn-primary gap-2">
      {addLabel}
    </button>
  {/if}
</div>
