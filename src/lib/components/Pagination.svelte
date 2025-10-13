<script lang="ts">
  export let totalItems: number = 0;
  export let currentPage: number = 1;
  export let pageSize: number = 10;
  export let onPageChange: (page: number) => void;

  $: totalPages = Math.ceil(totalItems / pageSize);

  // Function to generate page numbers with ellipsis for large number of pages
  function getVisiblePages(): Array<number | string> {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages: Array<number | string> = [];
    
    // Always show first page
    pages.push(1);
    
    if (currentPage > 3) {
      pages.push('...');
    }
    
    // Show current page and adjacent pages
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      pages.push(i);
    }
    
    if (currentPage < totalPages - 2) {
      pages.push('...');
    }
    
    // Always show last page if it's not already included
    if (totalPages > 1) {
      pages.push(totalPages);
    }
    
    return pages;
  }
</script>

{#if totalPages > 1}
  <div class="flex flex-wrap justify-end items-center gap-1 mt-4">
    <button 
      class="btn btn-sm btn-outline" 
      disabled={currentPage === 1}
      on:click={() => onPageChange(currentPage - 1)}
    >
      &lt; Prev
    </button>
    
    {#each getVisiblePages() as page}
      {#if page === '...'}
        <span class="btn btn-sm btn-disabled opacity-50">...</span>
      {:else}
        <button
          class="btn btn-sm"
          class:selected={currentPage === page}
          on:click={() => onPageChange(page as number)}
        >
          {page}
        </button>
      {/if}
    {/each}
    
    <button 
      class="btn btn-sm btn-outline" 
      disabled={currentPage === totalPages}
      on:click={() => onPageChange(currentPage + 1)}
    >
      Next &gt;
    </button>
  </div>
{/if}
