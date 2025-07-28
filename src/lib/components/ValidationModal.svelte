<script lang="ts">
  export let show: boolean = false;
  export let title: string = "Validasi Gagal";
  export let messages: string[] = [];
  export let onClose: () => void = () => {};
</script>

{#if show}
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" on:click={onClose}>
    <div
      class="bg-base-100 p-6 rounded-lg shadow-md max-w-md w-full animate-fade-in"
      on:click|stopPropagation
    >
      <h2 class="text-lg font-bold text-center">{title}</h2>
      <ul class="mt-4 space-y-1 text-sm text-red-600 text-center">
        {#each messages as msg}
          <li>• {msg}</li>
        {/each}
      </ul>
      <div class="mt-6">
        <button class="btn btn-warning w-full" on:click={onClose}>Tutup</button>
      </div>
    </div>
  </div>
{/if}
