<script lang="ts">
  import { createEventDispatcher } from "svelte";
  export let show: boolean = false;

  const dispatch = createEventDispatcher();

  function handleClose() {
    dispatch("close");
  }
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
      class="bg-base-100 rounded-lg p-6 w-full max-w-md shadow-lg"
      on:click|stopPropagation
    >
      <slot />
    </div>
  </div>
{/if}
