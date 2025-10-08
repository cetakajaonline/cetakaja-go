<script lang="ts">
  import { createEventDispatcher } from "svelte";
  export let show: boolean = false;
  export let size: 'sm' | 'md' | 'lg' | 'xl' | 'fullscreen' = 'md';

  const dispatch = createEventDispatcher();
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
{#if show}
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- Tambahkan  on:click={handleClose} Klo mau close klik diluar modal -->
  <div
    class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-2"
  >
    <!-- Berhenti agar klik dalam modal tidak close -->
    <div
      class="bg-base-100 rounded-lg p-6 shadow-lg"
      class:max-w-sm={size === 'sm'}
      class:max-w-lg={size === 'lg'}
      class:max-w-xl={size === 'xl'}
      class:w-full={size === 'fullscreen'}
      class:h-full={size === 'fullscreen'}
      class:max-w-full={size === 'fullscreen'}
      class:max-h-full={size === 'fullscreen'}
      on:click|stopPropagation
    >
      <slot />
    </div>
  </div>
{/if}
