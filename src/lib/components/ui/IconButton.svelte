<script lang="ts">
  import type { ComponentType } from 'svelte'; // untuk tipe icon dari lucide

  export let icon: ComponentType | null = null;
  export let color = 'btn-primary'; // btn-success, btn-error, dll
  export let onClick = () => {};
</script>

<button on:click={onClick} class="btn btn-sm {color}">
  {#if icon}
    <svelte:component this={icon} class="w-4 h-4" />
  {/if}
</button>
