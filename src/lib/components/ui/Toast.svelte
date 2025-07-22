<!-- src/lib/components/ui/Toast.svelte -->
<script lang="ts">
  export let show = false;
  export let message = '';
  export let type: 'info' | 'success' | 'warning' | 'error' = 'info';

  $: visible = show;
</script>

{#if visible}
  <div class={`toast toast-top toast-end`}>
    <div class={`alert alert-${type}`}>
      <span>{message}</span>
    </div>
  </div>
{/if}
