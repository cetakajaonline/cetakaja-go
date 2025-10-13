<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import FormInput from '$lib/components/ui/FormInput.svelte';
  import Modal from '$lib/components/ui/Modal.svelte';
  import type { Product, ProductVariant } from '$lib/types';
  import { getAllCategories } from '$lib/services/categoryClient';

  export let show = false;
  export let isEditMode = false;
  export let loading = false;
  export let isAdmin = false;
  export let initial = {
    name: '',
    description: '',
    baseCode: '',
    photo: '',
    categoryId: 0,
    variants: [] as { id?: number; variantName: string; price: number; delete?: boolean }[]
  };

  const dispatch = createEventDispatcher();

  let name = '';
  let description = '';
  let baseCode = '';
  let photo: string | File | null = null;
  let photoPreview: string | null = null;
  let categoryId = 0;
  let variants = [] as { id?: number; variantName: string; price: number; delete?: boolean }[];

  // Initialize photoPreview with initial photo when modal opens
  $: if (show && !isLoadingCategories && initial.photo) {
    photoPreview = typeof initial.photo === 'string' ? initial.photo : null;
  }
  
  let categories = [] as { id: number; name: string }[];
  let isLoadingCategories = true;

  // Initialize categories
  async function loadCategories() {
    try {
      categories = await getAllCategories();
      isLoadingCategories = false;
    } catch (err) {

      isLoadingCategories = false;
    }
  }

  // Reset saat modal dibuka
  $: if (show && !isLoadingCategories) {
    name = initial.name;
    description = initial.description || '';
    baseCode = initial.baseCode;
    photo = initial.photo || null;
    photoPreview = typeof initial.photo === 'string' && initial.photo ? initial.photo : null;
    categoryId = initial.categoryId || 0;
    variants = initial.variants && initial.variants.length > 0 
      ? [...initial.variants] 
      : [{ variantName: '', price: 0 }];
  }

  // Initialize categories when modal opens
  $: if (show && isLoadingCategories) {
    loadCategories();
  }

  function addVariant() {
    variants = [...variants, { variantName: '', price: 0 }];
  }

  function removeVariant(index: number) {
    if (variants.length > 1) {
      const variant = variants[index];
      if (variant.id) {
        // Mark for deletion instead of removing immediately
        variants = variants.map((v, i) => 
          i === index ? { ...v, delete: true } : v
        );
      } else {
        // Remove new variant that hasn't been saved yet
        variants = variants.filter((_, i) => i !== index);
      }
    }
  }

  function updateVariant(
    index: number,
    field: 'variantName' | 'price',
    value: string | number
  ) {
    // Create a copy of the array to ensure reactivity
    const newVariants = [...variants];
    const variant = { ...newVariants[index] };
    if (field === 'price') {
      variant.price = Number(value);
    } else {
      variant.variantName = String(value);
    }
    newVariants[index] = variant;
    variants = newVariants;
  }

  async function handleSubmit() {
    // Filter out empty variants before submitting
    const validVariants = variants.filter(v => 
      v.variantName.trim() && v.price > 0
    );
    
    // Check if we have at least one valid variant
    if (validVariants.length === 0) {
      // Show an error to the user
      alert("Produk harus memiliki setidaknya satu varian yang valid dengan nama dan harga");
      return;
    }
    
    // If photo is a File, we need to upload it first and get the path
    let processedPhoto: string | null = null;
    
    if (photo instanceof File) {
      // Upload the file first
      const formData = new FormData();
      formData.append('photo', photo);
      
      const uploadResponse = await fetch('/api/products/upload', {
        method: 'POST',
        body: formData
      });
      
      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json();
        alert(errorData.message || 'Gagal mengupload foto produk');
        return;
      }
      
      const uploadResult = await uploadResponse.json();
      processedPhoto = uploadResult.photoPath;
    } else {
      // If photo is already a string path, use it as is, or null if empty
      processedPhoto = typeof photo === 'string' && photo ? photo : null;
    }
    
    dispatch('submit', {
      name,
      description,
      baseCode,
      photo: processedPhoto,
      categoryId,
      variants: validVariants,
    });
  }
  
  // Helper function to format currency
  function formatCurrency(price: number): string {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price);
  }
  
  // Helper function to parse currency input
  function parseCurrency(value: string): number {
    return parseInt(value.replace(/[^0-9]/g, '')) || 0;
  }
</script>

<Modal {show} size="xl" on:close={() => dispatch('close')}>
  <form on:submit|preventDefault={handleSubmit} class="p-6 w-full max-w-4xl mx-auto">
    <h2 class="text-xl font-semibold text-center mb-4">
      {isEditMode ? 'Edit Produk' : 'Tambah Produk'}
    </h2>

    <div class="grid grid-cols-2 gap-4">
      <FormInput label="Nama Produk" bind:value={name} required />
      <FormInput label="Kode Produk" bind:value={baseCode} required />
      <FormInput label="Deskripsi Produk" bind:value={description} />
      <div class="form-control w-full">
        <label for="category-select" class="label py-2">
          <span class="label-text font-medium">Kategori</span>
        </label>
        {#if isLoadingCategories}
          <div class="loading loading-spinner loading-md"></div>
        {:else}
          <select 
            id="category-select"
            bind:value={categoryId} 
            class="select select-bordered w-full"
            disabled={!categories.length}
          >
            <option value="" disabled>Pilih kategori</option>
            {#each categories as category}
              <option value={category.id}>{category.name}</option>
            {/each}
          </select>
        {/if}
      </div>
    </div>

    <!-- Photo Upload -->
    <div class="form-control w-full mt-4">
      <label for="photo-upload" class="label py-2">
        <span class="label-text font-medium">Foto Produk</span>
      </label>
      <div class="flex items-center gap-4">
        <div class="avatar">
          <div class="w-16 h-16 rounded">
            <img 
              src={photoPreview || (typeof photo === 'string' ? photo : "/uploads/logo.png")} 
              alt="Preview"
              class="object-contain w-full h-full rounded"
            />
          </div>
        </div>
        <div class="flex-1">
          <input
            id="photo-upload"
            type="file"
            accept="image/*"
            class="file-input file-input-bordered w-full"
            disabled={!isAdmin}
            on:change={(e) => {
              const target = e.target as HTMLInputElement;
              if (target.files && target.files[0]) {
                const selectedFile = target.files[0];
                photo = selectedFile; // Simpan file object
                
                // Buat preview menggunakan FileReader seperti di settings
                const reader = new FileReader();
                reader.onload = () => {
                  photoPreview = reader.result as string;
                };
                reader.readAsDataURL(selectedFile);
              }
            }}
          />
        </div>
      </div>
    </div>

    <div class="divider my-2">Varian Produk</div>
    
    {#each variants as variant, i (variant.id || i)}
      {#if !variant.delete}
        <div class="card bg-base-200 p-4">
          <div class="grid grid-cols-1 md:grid-cols-12 gap-2 items-end">
            <div class="md:col-span-5">
              <FormInput 
                label="Nama Varian" 
                bind:value={variants[i].variantName}
                required
              />
            </div>
            <div class="md:col-span-5">
              <label for="price-{i}" class="label py-1">
                <span class="label-text font-medium">Harga</span>
              </label>
              <input
                id="price-{i}"
                type="text"
                class="input input-bordered w-full"
                value={formatCurrency(variants[i].price)}
                on:input={(e) => {
                  const rawValue = (e.target as HTMLInputElement).value;
                  const numericValue = parseCurrency(rawValue);
                  variants[i].price = numericValue;
                }}
                required
              />
            </div>
            <div class="md:col-span-2 flex items-center justify-center gap-1">
              <Button 
                type="button" 
                className="btn-error btn-circle btn-sm" 
                on:click={() => removeVariant(i)}
                disabled={variants.filter(v => !v.delete).length <= 1}
              >
                x
              </Button>
              {#if i === variants.length - 1}
                <Button 
                  type="button" 
                  className="btn-info btn-outline btn-circle btn-sm" 
                  on:click={addVariant}
                >
                  +
                </Button>
              {/if}
            </div>
          </div>
        </div>
      {/if}
    {/each}

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