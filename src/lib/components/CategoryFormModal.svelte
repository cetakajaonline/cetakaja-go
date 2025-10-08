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
    code: '',
    description: '',
  };

  const dispatch = createEventDispatcher();

  let name = '';
  let code = '';
  let description = '';

  // Reset saat modal dibuka
  $: if (show) {
    name = initial.name;
    code = initial.code;
    description = initial.description || '';
  }

  async function handleSubmit() {
    dispatch('submit', {
      name,
      code,
      description,
    });
  }
</script>

<Modal {show} on:close={() => dispatch('close')}>
  <form on:submit|preventDefault={handleSubmit} class="space-y-4 p-6 w-full max-w-md mx-auto">
    <h2 class="text-xl font-semibold text-center mb-2">
      {isEditMode ? 'Edit Kategori' : 'Tambah Kategori'}
    </h2>

    <FormInput label="Nama Kategori" bind:value={name} required />
    <FormInput label="Kode Kategori" bind:value={code} required />
    <FormInput label="Deskripsi" bind:value={description} />

    <div class="flex justify-center gap-4 mt-6">
      <Button type="submit" className="btn-primary" loading={loading}>
        {isEditMode ? 'Simpan' : 'Tambah'}
      </Button>
      <Button type="button" className="btn-outline" on:click={() => dispatch('close')}>
        Batal
      </Button>
    </div>
  </form>
</Modal>