<script lang="ts">
  import DefaultLayout from '$lib/layouts/DefaultLayout.svelte';
  import FormInput from '$lib/components/ui/FormInput.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import NotificationModal from '$lib/components/NotificationModal.svelte';
  import { invalidateAll } from "$app/navigation";
  import { tick } from "svelte";

  let isSubmitting = false;
  let showNotifModal = false;
  let notifTitle = '';
  let notifMessage = '';
  let notifType: 'success' | 'error' = 'success';

  function closeNotifModal() {
    showNotifModal = false;
  }

  export let data;
  let name = '';
  let description = '';
  let file: File | null = null;
  let logoPreview: string | null = null;
  let fileInput: HTMLInputElement; // untuk reset input file

  const isAdmin = data.user?.role === 'admin';

  // isi awal dari data load
  $: if (data?.setting) {
    name = data.setting.name ?? '';
    description = data.setting.description ?? '';
    logoPreview = data.setting.logo ?? null;
  }



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
    try {
      isSubmitting = true;

      const form = new FormData();
      form.append("name", name);
      form.append("description", description);
      if (file) form.append("logo", file);

      const res = await fetch("/api/settings", {
        method: "POST",
        body: form
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || "Gagal menyimpan konfigurasi");
      }

      // ambil setting terbaru dari response API
      const updated = await res.json();
      name = updated.name;
      description = updated.description;
      logoPreview = updated.logo ?? null;
      file = null;
      if (fileInput) fileInput.value = ""; // reset input file

      notifTitle = "Berhasil";
      notifMessage = "Konfigurasi berhasil disimpan.";
      notifType = "success";
      showNotifModal = true;

      // pastikan modal muncul dulu, baru invalidate data di seluruh app
      await tick();
      await invalidateAll();

    } catch (err: any) {
      notifTitle = "Gagal";
      notifMessage = err.message || "Terjadi kesalahan.";
      notifType = "error";
      showNotifModal = true;
    } finally {
      isSubmitting = false;
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
          <input
            bind:this={fileInput}
            type="file"
            accept="image/*"
            on:change={handleLogoChange}
            class="file-input w-full"
          />
        </div>

        <div class="flex justify-center gap-4 mt-6">
          <Button type="submit" className="btn-primary text-center py-2" disabled={isSubmitting}>
            {#if isSubmitting}
              Menyimpan...
            {:else}
              Simpan
            {/if}
          </Button>
        </div>
      {/if}
    </form>
  </div>

  <NotificationModal
    show={showNotifModal}
    title={notifTitle}
    message={notifMessage}
    type={notifType}
    onClose={closeNotifModal}
  />
</DefaultLayout>
