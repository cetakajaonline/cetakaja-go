<script lang="ts">
  import DefaultLayout from '$lib/layouts/DefaultLayout.svelte';
  import FormInput from '$lib/components/ui/FormInput.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import NotificationModal from '$lib/components/NotificationModal.svelte';
  import { invalidateAll } from "$app/navigation";
  import { updateSetting } from "$lib/services/settingClient";
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
  let bankName = '';
  let bankCode = '';
  let bankAccountNumber = '';
  let bankAccountName = '';
  let cashPaymentInstruction = '';
  let qrisPaymentInstruction = '';
  let bankTransferInstruction = '';
  let file: File | null = null;
  let qrisImageFile: File | null = null;
  let logoPreview: string | null = null;
  let qrisImagePreview: string | null = null;
  let fileInput: HTMLInputElement; // untuk reset input file
  let qrisImageInput: HTMLInputElement; // untuk reset input file QRIS

  const isAdmin = data.user?.role === 'admin';

  // isi awal dari data load
  $: if (data?.setting) {
    name = data.setting.name ?? '';
    description = data.setting.description ?? '';
    bankName = data.setting.bankName ?? '';
    bankCode = data.setting.bankCode ?? '';
    bankAccountNumber = data.setting.bankAccountNumber ?? '';
    bankAccountName = data.setting.bankAccountName ?? '';
    cashPaymentInstruction = data.setting.cashPaymentInstruction ?? '';
    qrisPaymentInstruction = data.setting.qrisPaymentInstruction ?? '';
    bankTransferInstruction = data.setting.bankTransferInstruction ?? '';
    logoPreview = data.setting.logo ?? null;
    qrisImagePreview = data.setting.qrisImage ?? null;
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

  async function handleQrisImageChange(e: Event) {
    const target = e.target as HTMLInputElement;
    qrisImageFile = target.files?.[0] ?? null;

    if (qrisImageFile) {
      const reader = new FileReader();
      reader.onload = () => {
        qrisImagePreview = reader.result as string;
      };
      reader.readAsDataURL(qrisImageFile);
    }
  }

  async function handleSubmit() {
    try {
      isSubmitting = true;

      // Use the client-side service
      const response = await updateSetting(
        name,
        description,
        file,
        bankName,
        bankCode,
        bankAccountNumber,
        bankAccountName,
        qrisImageFile,
        cashPaymentInstruction,
        qrisPaymentInstruction,
        bankTransferInstruction
      );

      if (response.success) {
        // Update local state with response
        name = response.data?.name || '';
        description = response.data?.description || '';
        bankName = response.data?.bankName || '';
        bankCode = response.data?.bankCode || '';
        bankAccountNumber = response.data?.bankAccountNumber || '';
        bankAccountName = response.data?.bankAccountName || '';
        cashPaymentInstruction = response.data?.cashPaymentInstruction || '';
        qrisPaymentInstruction = response.data?.qrisPaymentInstruction || '';
        bankTransferInstruction = response.data?.bankTransferInstruction || '';
        logoPreview = response.data?.logo ?? null;
        qrisImagePreview = response.data?.qrisImage ?? null;
        file = null;
        qrisImageFile = null;
        if (fileInput) fileInput.value = ""; // reset input file
        if (qrisImageInput) qrisImageInput.value = ""; // reset QRIS image input

        notifTitle = "Berhasil";
        notifMessage = "Konfigurasi berhasil disimpan.";
        notifType = "success";
        showNotifModal = true;

        // pastikan modal muncul dulu, baru invalidate data di seluruh app
        await tick();
        await invalidateAll();
      } else {
        throw new Error(response.message || "Gagal menyimpan pengaturan");
      }
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
          <label class="label font-medium py-2" for="logo-input">Logo</label>
          <input
            id="logo-input"
            bind:this={fileInput}
            type="file"
            accept="image/*"
            on:change={handleLogoChange}
            class="file-input w-full"
          />
        </div>

        <!-- QRIS Image -->
        <div>
          {#if qrisImagePreview}
            <img src={qrisImagePreview} class="w-32 h-32 mt-2 object-contain rounded" alt="Preview QRIS" />
          {/if}
          <label class="label font-medium py-2" for="qris-input">Gambar QRIS</label>
          <input
            id="qris-input"
            bind:this={qrisImageInput}
            type="file"
            accept="image/*"
            on:change={handleQrisImageChange}
            class="file-input w-full"
          />
        </div>

        <!-- Bank Settings -->
        <FormInput label="Nama Bank" bind:value={bankName} readonly={!isAdmin} />
        <FormInput label="Kode Bank" bind:value={bankCode} readonly={!isAdmin} />
        <FormInput label="Nomor Rekening" bind:value={bankAccountNumber} readonly={!isAdmin} />
        <FormInput label="Atas Nama Rekening" bind:value={bankAccountName} readonly={!isAdmin} />

        <!-- Payment Instructions -->
        <div class="form-control w-full">
          <label for="cashPaymentInstruction" class="label">
            <span class="label-text">Instruksi Pembayaran Tunai</span>
          </label>
          <textarea
            id="cashPaymentInstruction"
            class="textarea textarea-bordered w-full"
            bind:value={cashPaymentInstruction}
            placeholder="Instruksi pembayaran tunai"
            disabled={!isAdmin}
            rows="3"
          ></textarea>
        </div>

        <div class="form-control w-full">
          <label for="qrisPaymentInstruction" class="label">
            <span class="label-text">Instruksi Pembayaran QRIS</span>
          </label>
          <textarea
            id="qrisPaymentInstruction"
            class="textarea textarea-bordered w-full"
            bind:value={qrisPaymentInstruction}
            placeholder="Instruksi pembayaran QRIS"
            disabled={!isAdmin}
            rows="3"
          ></textarea>
        </div>

        <div class="form-control w-full">
          <label for="bankTransferInstruction" class="label">
            <span class="label-text">Instruksi Pembayaran Transfer Bank</span>
          </label>
          <textarea
            id="bankTransferInstruction"
            class="textarea textarea-bordered w-full"
            bind:value={bankTransferInstruction}
            placeholder="Instruksi pembayaran transfer bank"
            disabled={!isAdmin}
            rows="3"
          ></textarea>
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
