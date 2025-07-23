<script lang="ts">
  import DefaultLayout from '$lib/layouts/DefaultLayout.svelte';
  import FormInput from '$lib/components/ui/FormInput.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import { onMount } from 'svelte';

  export let data;
  let name = '';
  let description = '';
  let file: File | null = null;
  let logoPreview: string | null = null;

  const isAdmin = data.user?.role === 'admin';

  onMount(() => {
    name = data.setting?.name ?? '';
    description = data.setting?.description ?? '';
    logoPreview = data.setting?.logo ?? null;
  });

  async function handleLogoChange(e: Event) {
    const target = e.target as HTMLInputElement;
    file = target.files?.[0] ?? null;

    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        logoPreview = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  async function handleSubmit() {
    const form = new FormData();
    form.append('name', name);
    form.append('description', description);
    if (file) form.append('logo', file);

    const res = await fetch('/api/settings', {
      method: 'POST',
      body: form
    });

    if (res.ok) {
      alert('Konfigurasi disimpan');
    } else {
      const err = await res.text();
      alert('Gagal menyimpan konfigurasi: ' + err);
    }
  }
</script>

<DefaultLayout title="Settings">
  <div class="p-6 max-w-xl mx-auto space-y-6">
    <h1 class="text-2xl font-bold">Settings</h1>

    <form on:submit|preventDefault={handleSubmit} class="space-y-4">

      {#if logoPreview}
        <img src={logoPreview} class="w-32 h-32 mt-2 object-contain rounded" alt="Preview Logo" />
      {/if}

      <FormInput label="Nama Aplikasi" bind:value={name} required readonly={!isAdmin} />
      <FormInput label="Deskripsi" bind:value={description} readonly={!isAdmin} />

      {#if isAdmin}
        <div>
          <!-- svelte-ignore a11y_label_has_associated_control -->
          <label class="label font-medium py-2">Logo</label>
          <input type="file" accept="image/*" on:change={handleLogoChange} class="file-input w-full" />
        </div>
      {/if}

      {#if isAdmin}
        <div class="flex justify-center gap-4 mt-6">
          <Button type="submit" className="btn-primary text-center py-2">Simpan</Button>
        </div>
      {/if}
    </form>
  </div>
</DefaultLayout>
