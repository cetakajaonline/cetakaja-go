<script lang="ts">
    export let show = false;
    export let title = '';
    export let message = '';
    export let type: 'success' | 'error' = 'success'; // menentukan warna
    export let onClose: () => void = () => {};
  </script>
  
  {#if show}
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" on:click={onClose}>
      <div
        class="bg-base-100 p-6 rounded-lg shadow-md max-w-sm w-full animate-fade-in"
        on:click|stopPropagation
      >
        <h2 class="text-lg font-bold text-center {type === 'success' ? 'text-green-600' : 'text-red-600'}">
          {title}
        </h2>
        <p class="mt-4 text-center text-sm">{message}</p>
        <div class="mt-6">
          <button class="btn w-full {type === 'success' ? 'btn-success' : 'btn-error'}" on:click={onClose}>
            Tutup
          </button>
        </div>
      </div>
    </div>
  {/if}
  