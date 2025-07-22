<!-- src/lib/components/ui/Card.svelte -->
<script lang="ts">
  export let title: string = '';
  export let className: string = '';
</script>

<div class={`card bg-base-100 shadow-md ${className}`}>
  {#if title}
    <div class="card-title px-4 pt-4 text-lg font-semibold">{title}</div>
  {/if}
  <div class="card-body">
    <slot />
  </div>
</div>
