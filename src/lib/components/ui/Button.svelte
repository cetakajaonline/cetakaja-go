<script lang="ts">
  export let className = '';
  export let type: 'button' | 'submit' | 'reset' = 'button';
  export let loading = false;
  export let disabled = false;
</script>

<button
  type={type}
  disabled={disabled || loading}
  class={`btn ${className}`}
  on:click
  {...$$restProps}
>
  <slot />
</button>
