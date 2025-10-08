<script lang="ts">
  import { createEventDispatcher } from "svelte";
  export let show: boolean = false;
  export let size: 'sm' | 'md' | 'lg' | 'xl' | 'fullscreen' = 'md';

  const dispatch = createEventDispatcher();
  
  $: sizeClass = size === 'sm' ? 'w-80' :
      size === 'md' ? 'w-96 sm:w-[26rem]' :  /* ~416px */
      size === 'lg' ? 'w-[24rem] sm:w-[32rem] md:w-[42rem]' :  /* ~384px to ~672px */
      size === 'xl' ? 'w-screen sm:w-[32rem] md:w-[48rem] lg:w-[64rem] xl:w-[72rem]' :  /* Nearly full on mobile, very large on desktop */
      size === 'fullscreen' ? 'w-full h-full max-w-full max-h-full' :
      'w-96'; // Default
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
      class="bg-base-100 rounded-lg shadow-lg overflow-y-auto p-6 {sizeClass}"
      style="max-height: 80vh;"
      on:click|stopPropagation
    >
      <slot />
    </div>
  </div>
{/if}
