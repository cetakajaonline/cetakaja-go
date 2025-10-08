<!-- src/lib/components/ui/Alert.svelte -->
<script lang="ts">
  import { onMount } from 'svelte';
  
  let { 
    type = 'info',
    message = '',
    closable = false,
    autoClose = false,
    autoCloseTime = 5000,
    show = true
  }: {
    type?: 'info' | 'success' | 'warning' | 'error';
    message?: string;
    closable?: boolean;
    autoClose?: boolean;
    autoCloseTime?: number;
    show?: boolean;
  } = $props();
  
  let timer: number | null = null;
  let visible = $state(show);
  
  const icons = {
    info: 'ℹ️',
    success: '✅',
    warning: '⚠️',
    error: '❌'
  };
  
  function getIcon() {
    return icons[type as keyof typeof icons] || 'ℹ️';
  }
  
  function closeAlert() {
    visible = false;
  }
  
  onMount(() => {
    if (autoClose) {
      timer = setTimeout(() => {
        visible = false;
      }, autoCloseTime) as unknown as number;
    }
  });
  
  // The reactive statement is not necessary since we're using runes
  // The component will re-render when visible changes
</script>

{#if visible}
  <div class={`alert alert-${type} shadow-md my-2 flex items-start`}>
    <span class="text-lg mr-2">{getIcon()}</span>
    <span class="flex-1">{message}</span>
    {#if closable}
      <button 
        class="ml-4 text-lg hover:opacity-70 focus:outline-none" 
        onclick={closeAlert}
        aria-label="Close alert"
      >
        ✕
      </button>
    {/if}
  </div>
{/if}
