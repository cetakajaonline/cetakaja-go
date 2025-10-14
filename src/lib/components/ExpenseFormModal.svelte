<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import Modal from '$lib/components/ui/Modal.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import { formatCurrency } from '$lib/utils/formatters';
  import { dateToDateTimeLocal, dateTimeLocalToDate } from '$lib/utils/date';

  export let show: boolean = false;
  export let isEditMode: boolean = false;
  export let loading: boolean = false;
  export let initial: {
    nominal: number;
    category: "operasional" | "marketing" | "gaji" | "lainnya";
    date: Date;
    description: string;
    proofFile: File | null;
  };

  const dispatch = createEventDispatcher();

  let form = { ...initial };
  let proofFilePreview: string | null = null;

  // Reset form and preview when modal is shown
  $: if (show) {
    form = { ...initial };
    proofFilePreview = null;
  }

  $: if (show) {
    formDateTime = dateToDateTimeLocal(form.date);
  }

  let formDateTime: string = '';

  function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    // Convert the datetime string back to a Date object before submitting
    const formData = { ...form, date: dateTimeLocalToDate(formDateTime) };
    dispatch('submit', formData);
  }

  function handleClose() {
    dispatch('close');
  }

  function handleFileChange(event: Event) {
    const target = event.target as HTMLInputElement;
    if (target.files && target.files.length > 0) {
      form.proofFile = target.files[0];
      
      // Create a preview URL if it's an image
      if (target.files[0].type.startsWith('image/')) {
        proofFilePreview = URL.createObjectURL(target.files[0]);
      } else {
        proofFilePreview = null; // For non-image files, don't show preview
      }
    }
  }

  function removeProofFile() {
    form.proofFile = null;
    proofFilePreview = null;
  }


</script>

<Modal {show} size="lg" on:close={handleClose}>
  <form onsubmit={handleSubmit} class="p-6 w-full max-w-2xl mx-auto">
    <h2 class="text-xl font-semibold text-center mb-4">
      {isEditMode ? 'Edit' : 'Tambah'} Pengeluaran
    </h2>

    <div class="grid grid-cols-1 gap-4">
      <div class="form-control">
        <label class="label" for="nominal">
          <span class="label-text">Nominal *</span>
        </label>
        <input
          id="nominal"
          type="number"
          class="input input-bordered w-full"
          bind:value={form.nominal}
          required
          min="1"
          placeholder="Masukkan nominal pengeluaran"
          disabled={loading}
        />
      </div>

      <div class="form-control">
        <label class="label" for="category">
          <span class="label-text">Kategori *</span>
        </label>
        <select
          id="category"
          class="select select-bordered w-full"
          bind:value={form.category}
          required
          disabled={loading}
        >
          <option value="operasional">Operasional</option>
          <option value="marketing">Marketing</option>
          <option value="gaji">Gaji</option>
          <option value="lainnya">Lainnya</option>
        </select>
      </div>

      <div class="form-control">
        <label class="label" for="date">
          <span class="label-text">Tanggal & Waktu *</span>
        </label>
        <input
          id="date"
          type="datetime-local"
          class="input input-bordered w-full"
          bind:value={formDateTime}
          required
          disabled={loading}
        />
      </div>

      <div class="form-control">
        <label class="label" for="description">
          <span class="label-text">Deskripsi</span>
        </label>
        <textarea
          id="description"
          class="textarea textarea-bordered w-full"
          bind:value={form.description}
          placeholder="Tambahkan deskripsi (opsional)"
          rows="3"
          disabled={loading}
        ></textarea>
      </div>

      <div class="form-control">
        <label class="label" for="proofFile">
          <span class="label-text">Bukti File (Opsional)</span>
        </label>
        <input
          id="proofFile"
          type="file"
          class="file-input file-input-bordered w-full"
          onchange={handleFileChange}
          accept="image/*,application/pdf"
          disabled={loading}
        />
        
        {#if proofFilePreview}
          <div class="mt-2">
            <div class="flex items-center justify-between">
              <div class="flex-1">
                <img 
                  src={proofFilePreview} 
                  alt="Preview" 
                  class="w-full max-w-full h-auto max-h-48 object-contain rounded-lg"
                />
              </div>
              <button 
                type="button" 
                class="btn btn-xs btn-ghost ml-2"
                onclick={removeProofFile}
              >
                Hapus
              </button>
            </div>
          </div>
        {:else if form.proofFile}
          <div class="mt-2">
            <div class="flex items-center justify-between">
              <div class="flex-1 p-2 bg-gray-100 rounded border flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>File: {form.proofFile.name}</span>
              </div>
              <button 
                type="button" 
                class="btn btn-xs btn-ghost ml-2"
                onclick={removeProofFile}
              >
                Hapus
              </button>
            </div>
          </div>
        {/if}
      </div>
    </div>

    <div class="flex justify-center gap-4 mt-6">
      <Button type="submit" className="btn-primary" loading={loading}>
        {loading ? 'Memproses...' : (isEditMode ? 'Simpan Perubahan' : 'Tambah Pengeluaran')}
      </Button>
      <Button type="button" className="btn-outline" onclick={handleClose}>
        Batal
      </Button>
    </div>
  </form>
</Modal>