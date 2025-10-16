<script lang="ts">
    let { 
      show = false,
      title = '',
      message = '',
      type = 'success',
      onClose = () => {},
      autoClose = false,
      autoCloseTime = 3000 // 3 seconds
    }: {
      show?: boolean;
      title?: string;
      message?: string;
      type?: 'success' | 'error' | 'info' | 'warning';
      onClose?: () => void;
      autoClose?: boolean;
      autoCloseTime?: number;
    } = $props();

    let timer: number | null = null;

    $effect(() => {
      if (show && autoClose) {
        if (timer) clearTimeout(timer);
        timer = setTimeout(() => {
          onClose();
        }, autoCloseTime) as unknown as number;
      } else if (!show && timer) {
        clearTimeout(timer);
        timer = null;
      }
    });

    // Get icon based on type
    function getIcon() {
      switch (type) {
        case 'success': return '✅';
        case 'error': return '❌';
        case 'warning': return '⚠️';
        case 'info': return 'ℹ️';
        default: return 'ℹ️';
      }
    }

    // Get button classes based on type
    function getButtonClass() {
      switch (type) {
        case 'success': return 'btn-success';
        case 'error': return 'btn-error';
        case 'warning': return 'btn-warning';
        case 'info': return 'btn-info';
        default: return 'btn-primary';
      }
    }

    // Get border and background classes based on type with better contrast
    function getBorderClass() {
      switch (type) {
        case 'success': return 'border-success bg-success bg-opacity-10 text-success-content';
        case 'error': return 'border-error bg-error bg-opacity-10 text-error-content';
        case 'warning': return 'border-warning bg-warning bg-opacity-10 text-warning-content';
        case 'info': return 'border-info bg-info bg-opacity-10 text-info-content';
        default: return 'border-primary bg-primary bg-opacity-10';
      }
    }
  
  function handleClickInside(e: Event) {
    // Prevent the click from propagating to the parent overlay
    e.stopPropagation();
  }
  
  </script>
  
  {#if show}
    <div 
      class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" 
      role="button" 
      onclick={onClose}
      onkeydown={(e) => (e.key === 'Enter' || e.key === ' ') && onClose()}
      tabindex="0"
    >
      <div
        class="bg-base-100 p-6 rounded-xl shadow-2xl max-w-md w-full animate-fade-in transform transition-all duration-200"
        role="dialog"
        aria-modal="true"
        onclick={handleClickInside}
        onkeydown={(e) => (e.key === 'Enter' || e.key === ' ') && handleClickInside(e)}
        tabindex="0"
      >
        <div class="flex items-center justify-center mb-4">
          <div class="text-4xl mr-3">{getIcon()}</div>
          <h2 class="text-lg font-bold text-center capitalize">{title}</h2>
        </div>
        
        <div class="p-4 rounded-lg border {getBorderClass()} mb-4">
          <p class="text-center text-sm">{message}</p>
        </div>
        
        <div class="flex gap-2">
          <button 
            class="btn flex-1 {getButtonClass()}" 
            onclick={onClose}
            title="Tutup"
            aria-label="Tutup"
          >
            {#if autoClose}
              <span class="flex items-center justify-center">
                <span>✕</span>
                <span class="ml-2 text-xs">({Math.ceil(autoCloseTime / 1000)}s)</span>
              </span>
            {:else}
              ✕
            {/if}
          </button>
        </div>
      </div>
    </div>
  {/if}
  
