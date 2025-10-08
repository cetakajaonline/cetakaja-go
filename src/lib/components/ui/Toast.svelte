<!-- src/lib/components/ui/Toast.svelte -->
<script lang="ts">
  import { onMount } from 'svelte';
  
  let { 
    show = false,
    message = '',
    type = 'info',
    position = 'top-right',
    autoClose = true,
    autoCloseTime = 5000,
    closable = true
  }: {
    show?: boolean;
    message?: string;
    type?: 'info' | 'success' | 'warning' | 'error';
    position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
    autoClose?: boolean;
    autoCloseTime?: number;
    closable?: boolean;
  } = $props();
  
  let timer: number | null = null;
  let visible = $state(false);
  
  const positions = {
    'top-right': 'toast-top toast-end',
    'top-left': 'toast-top toast-start',
    'bottom-right': 'toast-bottom toast-end',
    'bottom-left': 'toast-bottom toast-start',
    'top-center': 'toast-top toast-center',
    'bottom-center': 'toast-bottom toast-center'
  };
  
  const icons = {
    info: 'ℹ️',
    success: '✅',
    warning: '⚠️',
    error: '❌'
  };
  
  function getIcon() {
    return icons[type as keyof typeof icons] || 'ℹ️';
  }
  
  function closeToast() {
    visible = false;
  }
  
  onMount(() => {
    if (show) {
      visible = true;
      if (autoClose && autoCloseTime > 0) {
        timer = setTimeout(() => {
          visible = false;
        }, autoCloseTime) as unknown as number;
      }
    }
  });
  
  // Using $effect for reactive behavior
  $effect(() => {
    if (show && !visible) {
      // Reset visibility for next show
      setTimeout(() => {
        if (!show) visible = false;
      }, 300);
    }
  
    if (show !== visible && show) {
      visible = show;
      if (autoClose && show) {
        if (timer) clearTimeout(timer);
        timer = setTimeout(() => {
          visible = false;
        }, autoCloseTime) as unknown as number;
      }
    }
  });
</script>

{#if visible}
  <div class="toast {positions[position]} z-[9999]">
    <div class={`alert alert-${type} shadow-lg flex items-start`}>
      <span class="text-lg mr-2">{getIcon()}</span>
      <span class="flex-1">{message}</span>
      {#if closable}
        <button 
          class="ml-4 text-lg hover:opacity-70 focus:outline-none" 
          onclick={closeToast}
          aria-label="Close toast"
        >
          ✕
        </button>
      {/if}
    </div>
  </div>
{/if}
