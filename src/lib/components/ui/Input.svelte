<!-- src/lib/components/ui/Input.svelte -->
<script lang="ts">
  export let type: string = 'text'; // bisa 'text', 'email', dll — abaikan jika textarea
  export let placeholder: string = '';
  export let value: string = '';
  export let className: string = '';
  export let required: boolean = false;
  export let name: string = '';
  export let id: string = '';
  export let readonly: boolean = false;
  export let disabled: boolean = false;
  export let multiline: boolean = false; // ✅ textarea jika true
  export let rows: number = 3;

  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();
</script>

{#if multiline}
  <textarea
    id={id}
    name={name}
    class={`textarea textarea-bordered w-full ${className}`}
    placeholder={placeholder}
    bind:value
    required={required}
    readonly={readonly}
    disabled={disabled}
    rows={rows}
    on:input={() => dispatch('input', value)}
  ></textarea>
{:else}
  <input
    id={id}
    type={type}
    name={name}
    class={`input input-bordered w-full ${className}`}
    placeholder={placeholder}
    bind:value
    required={required}
    readonly={readonly}
    disabled={disabled}
    on:input={() => dispatch('input', value)}
  />
{/if}
