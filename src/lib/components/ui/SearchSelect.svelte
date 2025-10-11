<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte';
  
  interface SearchSelectProps {
    options: { value: any; label: string }[];
    value?: any;
    label?: string;
    placeholder?: string;
    required?: boolean;
    disabled?: boolean;
    searchEnabled?: boolean;
    id?: string;
    autocomplete?: HTMLInputElement['autocomplete'];
  }
  
  let {
    options = [],
    value = $bindable(),
    label = '',
    placeholder = 'Cari...',
    required = false,
    disabled = false,
    searchEnabled = true,
    id,
    autocomplete = 'off'
  }: SearchSelectProps = $props();
  
  // Generate a unique id if not provided
  let elementId = $state(id || `search-select-${Math.random().toString(36).substr(2, 9)}`);
  
  const dispatch = createEventDispatcher();
  
  let isOpen = $state(false);
  let searchQuery = $state('');
  let focusedOptionIndex = $state(-1);
  let container: HTMLDivElement;
  
  // Filter options based on search query
  let filteredOptions = $derived(
    searchQuery 
      ? options.filter(option => 
          option.label.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : options
  );
  
  // Close dropdown when clicking outside
  function handleClickOutside(e: Event) {
    if (container && !container.contains(e.target as Node)) {
      isOpen = false;
    }
  }
  
  onMount(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  });
  
  function handleOptionSelect(option: { value: any; label: string }) {
    value = option.value;
    searchQuery = option.label;
    isOpen = false;
    dispatch('change', { value: option.value, label: option.label });
  }
  
  function handleInput(e: Event) {
    const target = e.target as HTMLInputElement;
    searchQuery = target.value;
    value = null;
    
    if (searchEnabled) {
      isOpen = true;
      focusedOptionIndex = -1;
    }
    
    dispatch('input', { value: target.value });
  }
  
  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (isOpen) {
        focusedOptionIndex = Math.min(focusedOptionIndex + 1, filteredOptions.length - 1);
      } else {
        isOpen = true;
        focusedOptionIndex = 0;
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (isOpen) {
        focusedOptionIndex = Math.max(focusedOptionIndex - 1, -1);
      } else {
        isOpen = true;
        focusedOptionIndex = filteredOptions.length - 1;
      }
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (isOpen && focusedOptionIndex >= 0 && filteredOptions[focusedOptionIndex]) {
        handleOptionSelect(filteredOptions[focusedOptionIndex]);
      } else if (!isOpen && searchEnabled) {
        isOpen = true;
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      isOpen = false;
      focusedOptionIndex = -1;
    }
  }
  
  $effect(() => {
    if (value !== null && options.length > 0) {
      const option = options.find(opt => opt.value === value);
      if (option && searchQuery !== option.label) {
        searchQuery = option.label;
      }
    }
  });
</script>

<div class="form-control w-full relative" bind:this={container}>
  {#if label}
    <label for={elementId} class="label py-2">
      <span class="label-text font-medium">
        {label}
        {#if required} * {/if}
      </span>
    </label>
  {/if}
  
  <div class="relative">
    <input
      id={elementId}
      type="text"
      class="input input-bordered w-full"
      placeholder={placeholder}
      bind:value={searchQuery}
      oninput={handleInput}
      onkeydown={handleKeyDown}
      onfocus={() => {
        if (searchEnabled) {
          // Clear the search query to show all options when dropdown opens
          searchQuery = '';
          isOpen = true;
        }
      }}
      readonly={!searchEnabled}
      disabled={disabled}
      autocomplete={autocomplete}
    />
    
    <div class="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center">
      {#if searchQuery && searchEnabled}
        <button
          type="button"
          class="mr-2 text-gray-400 hover:text-gray-600"
          onclick={() => {
            searchQuery = '';
            value = null;
            isOpen = true;
            dispatch('change', { value: null, label: '' });
          }}
          aria-label="Clear selection"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      {/if}
      {#if searchEnabled}
        <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
        </svg>
      {:else}
        <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 9l4-4 4 4m0 6l-4 4-4-4"></path>
        </svg>
      {/if}
    </div>
  </div>
  
  {#if isOpen && filteredOptions.length > 0}
    <div 
      class="absolute z-10 w-full mt-1 bg-base-100 border border-base-300 rounded-lg shadow-lg max-h-60 overflow-auto"
      role="listbox"
      aria-label="Pilihan"
    >
      {#each filteredOptions as option, i (option.value)}
        <div
          role="option"
          aria-selected={value === option.value}
          tabindex="0"
          class={`px-4 py-2 cursor-pointer hover:bg-base-200 text-base-content ${
            i === focusedOptionIndex ? 'bg-base-300' : ''
          }`}
          onclick={() => handleOptionSelect(option)}
          onkeydown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleOptionSelect(option);
            }
          }}
          onmouseenter={() => focusedOptionIndex = i}
        >
          {option.label}
        </div>
      {/each}
    </div>
  {/if}
</div>