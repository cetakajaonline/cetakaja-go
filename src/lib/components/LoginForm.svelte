<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import ValidationModal from '$lib/components/ValidationModal.svelte';

  let email = '';
  let password = '';
  let isLoading = false;
  let showErrorModal = false;
  let errorMessages: string[] = [];

  const dispatch = createEventDispatcher();

  async function handleLogin() {
    errorMessages = [];

    // Basic client-side validation
    if (!email || !password) {
      errorMessages.push('Email dan password wajib diisi');
      showErrorModal = true;
      return;
    }

    try {
      isLoading = true;
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
        headers: { 'Content-Type': 'application/json' }
      });

      const data = await res.json();
      isLoading = false;

      if (res.ok && data.success) {
        dispatch('success');
      } else {
        errorMessages = [data?.message ?? 'Email atau password salah'];
        showErrorModal = true;
      }
    } catch (err) {
      console.error('Login error:', err);
      isLoading = false;
      errorMessages = ['Terjadi kesalahan jaringan.'];
      showErrorModal = true;
    }
  }
</script>

<form on:submit|preventDefault={handleLogin} class="max-w-sm mx-auto mt-4 p-4 bg-base-100 rounded shadow space-y-3">
  <input
    bind:value={email}
    placeholder="Email"
    class="input input-bordered w-full"
    type="email"
    autocomplete="email"
    required
  />
  <input
    bind:value={password}
    type="password"
    placeholder="Password"
    class="input input-bordered w-full"
    autocomplete="current-password"
    required
  />
  <button class="btn btn-primary w-full" type="submit" disabled={isLoading}>
    {#if isLoading}
      <!-- svelte-ignore element_invalid_self_closing_tag -->
      <span class="loading loading-spinner" /> Loading...
    {:else}
      Login
    {/if}
  </button>
</form>

<ValidationModal
  show={showErrorModal}
  title="Login Gagal"
  messages={errorMessages}
  onClose={() => (showErrorModal = false)}
/>
