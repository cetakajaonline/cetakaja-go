<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import FormInput from '$lib/components/ui/FormInput.svelte';
  import Modal from '$lib/components/ui/Modal.svelte';

  export let show = false;
  export let isEditMode = false;
  export let loading = false;
  export let isAdmin = false;
  export let initial = {
    name: '',
    email: '',
    password: '',
    photo: '',
    role: 'user'
  };

  const dispatch = createEventDispatcher();

  let name = '';
  let email = '';
  let password = '';
  let file: File | null = null;
  let previewUrl: string | null = null;
  let role = 'user';

  // Reset saat modal dibuka
  $: if (show) {
    name = initial.name;
    email = initial.email;
    password = '';
    file = null;
    previewUrl = initial.photo || null;
    role = initial.role || 'user';
  }

  function handleFileChange(e: Event) {
    const target = e.target as HTMLInputElement;
    file = target?.files?.[0] ?? null;

    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        previewUrl = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  async function handleSubmit() {
    let photoUrl = initial.photo;

    if (file) {
      const form = new FormData();
      form.append('file', file);

      const res = await fetch('/api/users/upload', {
        method: 'POST',
        body: form,
      });

      const result = await res.json();
      photoUrl = result.url;
    }

    dispatch('submit', {
      name,
      email,
      password,
      photo: photoUrl,
      role // ⬅️ kirim role apapun yg dipilih, filtering di +page.svelte
    });
  }
</script>

<Modal {show} on:close={() => dispatch('close')}>
  <form on:submit|preventDefault={handleSubmit} class="space-y-4 p-6 w-full max-w-md mx-auto">
    <h2 class="text-xl font-semibold text-center mb-2">
      {isEditMode ? 'Edit Pengguna' : 'Tambah Pengguna'}
    </h2>

    <FormInput label="Nama" bind:value={name} required />
    <FormInput label="Email" type="email" bind:value={email} required />
    <FormInput
      label="Password"
      type="password"
      bind:value={password}
      required={!isEditMode}
      placeholder={isEditMode ? '(Biarkan kosong jika tidak diubah)' : ''}
    />

    {#if isAdmin}
      <div class="form-control">
        <!-- svelte-ignore a11y_label_has_associated_control -->
        <label class="label py-2">
          <span class="label-text font-medium">Role</span>
        </label>
        <select bind:value={role} class="select select-bordered w-full">
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>
      </div>
    {/if}

    <div class="form-control">
      <!-- svelte-ignore a11y_label_has_associated_control -->
      <label class="label py-2">
        <span class="label-text font-medium">Foto (opsional)</span>
      </label>
      <input
        type="file"
        accept="image/*"
        class="file-input file-input-bordered w-full"
        on:change={handleFileChange}
      />
      {#if previewUrl}
        <div class="mt-3">
          <p class="text-sm mb-1 text-gray-500">Preview Foto:</p>
          <img src={previewUrl} alt="Preview" class="w-24 h-24 rounded-full object-cover border" />
        </div>
      {/if}
    </div>

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
