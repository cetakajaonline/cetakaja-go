<script lang="ts">
  let { 
    show = false,
    title = "Gagal",
    messages = [],
    onClose = () => {}
  }: {
    show?: boolean;
    title?: string;
    messages?: string[];
    onClose?: () => void;
  } = $props();
  
  function handleClickInside(e: Event) {
    // Prevent the click from propagating to the parent overlay
    e.stopPropagation();
  }
  
  // Get icon for validation errors (always error type)
  function getIcon() {
    return '❌'; // Error icon for validation
  }
  
  // Get styling classes for error type
  function getBorderClass() {
    return 'border-error border-opacity-50 bg-error bg-opacity-5';
  }
  
  function getButtonClass() {
    return 'btn-error';
  }
</script>

{#if show}
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" onclick={onClose}>
    <div
      class="bg-base-100 p-6 rounded-xl shadow-2xl max-w-md w-full animate-fade-in transform transition-all duration-200"
      onclick={handleClickInside}
    >
      <div class="flex items-center justify-center mb-4">
        <div class="text-md mr-3">{getIcon()}</div>
        <h2 class="text-md font-bold text-center capitalize">{title}</h2>
      </div>
      
      <div class="p-4 mb-4">
        <ul class="space-y-2">
          {#each messages as msg, i}
            <li class="flex items-start text-sm">
              <span class="flex-1 text-center">{msg}</span>
            </li>
          {/each}
        </ul>
      </div>
      
      <div class="flex gap-2">
        <button 
          class="btn flex-1 {getButtonClass()}" 
          onclick={onClose}
        >
          Tutup
        </button>
      </div>
    </div>
  </div>
{/if}