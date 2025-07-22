<!-- src/lib/components/ui/Input.svelte -->
<script lang="ts">
  export let type: string = 'text';
  export let placeholder: string = '';
  export let value: string = '';
  export let className: string = '';
  export let required: boolean = false;
  export let name: string = '';

  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();
</script>

<input
  type={type}
  name={name}
  class={`input input-bordered w-full ${className}`}
  placeholder={placeholder}
  bind:value
  required={required}
  on:input={() => dispatch('input', value)}
/>
