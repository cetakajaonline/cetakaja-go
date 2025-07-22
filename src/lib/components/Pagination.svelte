<script lang="ts">
  export let totalItems: number = 0;
  export let currentPage: number = 1;
  export let pageSize: number = 10;
  export let onPageChange: (page: number) => void;

  $: totalPages = Math.ceil(totalItems / pageSize);
</script>

{#if totalPages > 1}
  <div class="flex justify-end items-center gap-2 mt-4">
    {#each Array(totalPages) as _, i}
      <button
        class="btn btn-sm"
        class:selected={currentPage === i + 1}
        on:click={() => onPageChange(i + 1)}
      >
        {i + 1}
      </button>
    {/each}
  </div>
{/if}
