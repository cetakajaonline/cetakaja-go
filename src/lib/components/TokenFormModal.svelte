<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import FormInput from '$lib/components/ui/FormInput.svelte';
  import Modal from '$lib/components/ui/Modal.svelte';

  export let show = false;
  export let isEditMode = false;
  export let loading = false;
  export let initial = {
    name: '',
    token: ''
  };

  const dispatch = createEventDispatcher();

  let name = '';
  let token = '';

  function generateToken(length = 32) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  // Reset saat modal dibuka
  $: if (show) {
    name = initial.name;
    token = isEditMode ? initial.token : generateToken();
  }

  function handleSubmit() {
    dispatch('submit', { name, token });
  }
</script>

<Modal {show} on:close={() => dispatch('close')}>
  <form on:submit|preventDefault={handleSubmit} class="space-y-4 p-6 w-full max-w-md mx-auto">
    <h2 class="text-xl font-semibold text-center mb-4">
      {isEditMode ? 'Edit API Token' : 'Tambah API Token'}
    </h2>

    <FormInput label="Nama Token" bind:value={name} required />
    <FormInput label="Token" bind:value={token} />

    <div class="flex justify-center gap-4 mt-6">
      <Button type="submit" className="btn-primary" {loading}>
        {isEditMode ? 'Simpan' : 'Tambah'}
      </Button>
      <Button type="button" className="btn-outline" on:click={() => dispatch('close')}>
        Batal
      </Button>
    </div>
  </form>
</Modal>
