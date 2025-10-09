<script lang="ts">
  export let label = '';
  export let type: string = 'text';
  export let placeholder = '';
  export let value: string = '';
  export let hint = '';
  export let required = false;
  export let name = '';
  export let className = '';
  export let readonly = false;

  import Input from '$lib/components/ui/Input.svelte';
  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();
</script>

<div class="form-control w-full">
  {#if label}
    <label class="label py-2" for="form-input-{name || Math.random().toString(36).substring(2, 9)}">
      <span class="label-text font-medium">{label}{required ? ' *' : ''}</span>
    </label>
  {/if}

  <Input
    {type}
    {placeholder}
    {required}
    id="form-input-{name || Math.random().toString(36).substring(2, 9)}"
    {name}
    {readonly}
    className={`input input-bordered w-full ${className}`}
    bind:value
    on:input={(e) => dispatch('input', e.detail)}
  />

  {#if hint}
    <div class="label">
      <span class="label-text-alt text-xs text-gray-500">{hint}</span>
    </div>
  {/if}
</div>
