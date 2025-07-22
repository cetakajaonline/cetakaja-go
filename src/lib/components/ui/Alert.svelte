<!-- src/lib/components/ui/Alert.svelte -->
<script lang="ts">
  export let type: 'info' | 'success' | 'warning' | 'error' = 'info';
  export let message: string = '';
</script>

<div class={`alert alert-${type} shadow-sm my-2`}>
  <span>{message}</span>
</div>
