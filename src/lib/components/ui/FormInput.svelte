<script lang="ts">
  export let label = '';
  export let type: string = 'text';
  export let placeholder = '';
  export let value: string = '';
  export let hint = '';
  export let required = false;
  export let name = '';
  export let className = '';

  import Input from '$lib/components/ui/Input.svelte';
  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();
</script>

<div class="form-control w-full">
  <!-- svelte-ignore a11y_label_has_associated_control -->
  <label class="label py-2">
    <span class="label-text font-medium">{label}{required ? ' *' : ''}</span>
  </label>

  <Input
    {type}
    {placeholder}
    {required}
    {name}
    className={`input input-bordered w-full ${className}`}
    bind:value
    on:input={(e) => dispatch('input', e.detail)}
  />

  {#if hint}
    <!-- svelte-ignore a11y_label_has_associated_control -->
    <label class="label">
      <span class="label-text-alt text-xs text-gray-500">{hint}</span>
    </label>
  {/if}
</div>
