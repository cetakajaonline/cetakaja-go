<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  let email = '';
  let password = '';
  let isLoading = false;
  let error = '';

  const dispatch = createEventDispatcher();

  async function login() {
    isLoading = true;
    error = '';

    const res = await fetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
      headers: { 'Content-Type': 'application/json' }
    });

    const data = await res.json();
    isLoading = false;

    if (res.ok) {
      dispatch('success'); // bisa pakai router.push jika SSR
    } else {
      error = data.message ?? 'Terjadi kesalahan saat login';
    }
  }
</script>

<div class="max-w-sm mx-auto mt-4 p-4 bg-white rounded shadow">
  {#if error}
    <p class="text-red-500 mb-2 text-center">{error}</p>
  {/if}
  <input
    bind:value={email}
    placeholder="Email"
    class="input input-bordered w-full mb-2"
    autocomplete="email"
    required
  />
  <input
    bind:value={password}
    type="password"
    placeholder="Password"
    class="input input-bordered w-full mb-2"
    autocomplete="current-password"
    required
  />
  <button on:click={login} class="btn btn-primary w-full" disabled={isLoading}>
    {#if isLoading}Loading...{/if}
    {#if !isLoading}Login{/if}
  </button>
</div>
