<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();

  let keyword = '';

  function handleInput() {
    dispatch('search', keyword);
  }
</script>

<div class="w-full mb-4">
  <input
    type="text"
    bind:value={keyword}
    on:input={handleInput}
    placeholder="🔍 Cari..."
    class="input input-bordered w-full"
  />
</div>
