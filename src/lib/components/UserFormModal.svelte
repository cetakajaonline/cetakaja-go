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
    username: '',
    password: '',
    phone: '',
    address: '',
    role: 'customer'
  };

  const dispatch = createEventDispatcher();

  let name = '';
  let username = '';
  let password = '';
  let phone = '';
  let address = '';
  let role = 'user';

  // Reset saat modal dibuka
  $: if (show) {
    name = initial.name;
    username = initial.username;
    password = '';
    phone = initial.phone || '';
    address = initial.address || '';
    role = initial.role || 'customer';
  }

  async function handleSubmit() {
    dispatch('submit', {
      name,
      username,
      password,
      phone,
      address,
      role // ⬅️ kirim role apapun yg dipilih, filtering di +page.svelte
    });
  }
</script>

<Modal {show} size="xl" on:close={() => dispatch('close')}>
  <form on:submit|preventDefault={handleSubmit} class="p-6 w-full max-w-4xl mx-auto">
    <h2 class="text-xl font-semibold text-center mb-4">
      {isEditMode ? 'Edit Pengguna' : 'Tambah Pengguna'}
    </h2>

    <div class="grid grid-cols-2 gap-4">
      <FormInput label="Nama" bind:value={name} required />
      <FormInput label="Username" bind:value={username} required />
      <FormInput label="No. HP" bind:value={phone} required />
      <FormInput label="Alamat" bind:value={address} />
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
            <option value="customer">Customer</option>
            <option value="staff">Staff</option>
            <option value="admin">Admin</option>
          </select>
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
