<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import FormInput from '$lib/components/ui/FormInput.svelte';
  import Modal from '$lib/components/ui/Modal.svelte';
  import type { Product, ProductVariant, ProductVariantOption } from '$lib/types';
  import { getAllCategories } from '$lib/services/categoryClient';
  import { formatCurrency, parseCurrency } from '$lib/utils/formatters';

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
    variants: [] as { 
      id?: number; 
      variantName: string; 
      options: { id?: number; optionName: string; price: number; delete?: boolean }[]; 
      delete?: boolean 
    }[]
  };

  const dispatch = createEventDispatcher();

  let name = '';
  let description = '';
  let baseCode = '';
  let photo: string | File | null = null;
  let photoPreview: string | null = null;
  let categoryId = 0;
  let variants = [] as { 
    id?: number; 
    variantName: string; 
    options: { id?: number; optionName: string; price: number; delete?: boolean }[]; 
    delete?: boolean 
  }[];

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

  // Initialize form when modal opens
  $: if (show && !isLoadingCategories) {
    name = initial.name || '';
    description = initial.description || '';
    baseCode = initial.baseCode || '';
    photo = initial.photo || null;
    photoPreview = typeof initial.photo === 'string' && initial.photo ? initial.photo : null;
    categoryId = initial.categoryId || 0;
    
    // For new products: start with empty variants array
    // For edit products: load existing variants (only non-deleted ones)
    if (initial.variants && initial.variants.length > 0) {
      // Load existing variants for editing
      variants = initial.variants
        .filter(v => !v.delete)  // Only non-deleted variants
        .map(v => ({
          ...v,
          options: (v.options || []).filter(opt => !opt.delete)  // Only non-deleted options
        }));
    } else {
      // For new products, start with empty variants array
      variants = [];
    }
  }

  // Initialize categories when modal opens
  $: if (show && isLoadingCategories) {
    loadCategories();
  }

  function addVariant() {
    const newVariant = {
      variantName: '',
      options: [{ optionName: '', price: 0, delete: false }],
      delete: false
    };
    variants = [...variants, newVariant];
  }

  function removeVariant(index: number) {
    const variant = variants[index];
    if (variants.length > 1) {
      if (variant.id) {
        // For existing variants, mark as deleted
        variants = variants.map((v, i) => 
          i === index ? { ...v, delete: true } : v
        );
      } else {
        // For new variants, remove completely
        variants = variants.filter((_, i) => i !== index);
      }
    }
  }

  function addOption(variantIndex: number) {
    const newVariants = [...variants];
    const variant = { ...newVariants[variantIndex] };
    if (!variant.options) {
      variant.options = [];
    }
    variant.options = [...variant.options, { optionName: '', price: 0, delete: false }];
    newVariants[variantIndex] = variant;
    variants = newVariants;
  }

  function removeOption(variantIndex: number, optionIndex: number) {
    const newVariants = [...variants];
    const variant = { ...newVariants[variantIndex] };
    if (variant.options && variant.options.length > 1) {
      const option = variant.options[optionIndex];
      if (option.id) {
        // For existing options, mark as deleted
        variant.options = variant.options.map((opt, i) => 
          i === optionIndex ? { ...opt, delete: true } : opt
        );
      } else {
        // For new options, remove completely
        variant.options = variant.options.filter((_, i) => i !== optionIndex);
      }
      newVariants[variantIndex] = variant;
      variants = newVariants;
    }
  }

  function updateOption(
    variantIndex: number,
    optionIndex: number,
    field: 'optionName' | 'price',
    value: string | number
  ) {
    const newVariants = [...variants];
    const variant = { ...newVariants[variantIndex] };
    if (!variant.options) {
      variant.options = [];
    }
    const newOptions = [...variant.options];
    const option = { ...newOptions[optionIndex] };
    
    if (field === 'price') {
      option.price = Number(value);
    } else {
      option.optionName = String(value);
    }
    
    newOptions[optionIndex] = option;
    variant.options = newOptions;
    newVariants[variantIndex] = variant;
    variants = newVariants;
  }

  async function handleSubmit() {
    // Validate that we have at least one valid variant
    const validVariants = variants.filter(v => {
      if (v.delete) return false;
      if (!v.variantName.trim()) return false;
      
      // Check options
      const validOptions = v.options?.filter(opt => 
        !opt.delete && opt.optionName.trim() && opt.price >= 0
      ) || [];
      
      return validOptions.length > 0;
    });

    if (validVariants.length === 0) {
      alert("Produk harus memiliki setidaknya satu varian yang valid dengan opsi");
      return;
    }
    
    // Handle photo upload if it's a File
    let processedPhoto: string | null = null;
    
    if (photo instanceof File) {
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
                photo = selectedFile;
                
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

    <div class="divider my-2">Varian & Opsi Produk</div>
    
    {#if variants.length === 0}
      <!-- Only show button initially for new products -->
      <div class="text-center py-8">
        <p class="text-gray-500 mb-4">Belum ada varian produk. Tambahkan varian terlebih dahulu.</p>
        <Button 
          type="button" 
          className="btn-primary"
          on:click={addVariant}
        >
          + Tambah Varian
        </Button>
      </div>
    {:else}
      <!-- Show existing variants and options -->
      {#each variants as variant, variantIndex (variant.id ? `variant-${variant.id}` : `new-variant-${variantIndex}`)}
        {#if !variant.delete}
          <div class="card bg-base-200 p-4 mb-4">
            <div class="grid grid-cols-1 md:grid-cols-12 gap-2 items-end mb-2">
              <div class="md:col-span-10">
                <FormInput 
                  label="Nama Varian" 
                  bind:value={variant.variantName}
                  required
                />
              </div>
              <div class="md:col-span-2 flex items-center justify-center gap-1">
                <Button 
                  type="button" 
                  className="btn-error btn-circle btn-sm" 
                  on:click={() => removeVariant(variantIndex)}
                  disabled={variants.filter(v => !v.delete).length <= 1}
                >
                  x
                </Button>
                {#if variantIndex === variants.filter(v => !v.delete).length - 1}
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
            
            <!-- Options for this variant -->
            <div class="ml-4 border-l-2 border-base-300 pl-4">
              <h4 class="font-medium mb-2">Opsi Varian</h4>
              {#each variant.options as option, optionIndex (option.id ? `option-${option.id}` : `new-option-${optionIndex}`)}
                {#if !option.delete}
                  <div class="grid grid-cols-1 md:grid-cols-12 gap-2 items-end mb-2">
                    <div class="md:col-span-5">
                      <FormInput 
                        label="Nama Opsi" 
                        bind:value={option.optionName}
                        required
                      />
                    </div>
                    <div class="md:col-span-5">
                      <label for="price-{variantIndex}-{optionIndex}" class="label py-1">
                        <span class="label-text font-medium">Harga</span>
                      </label>
                      <input
                        id="price-{variantIndex}-{optionIndex}"
                        type="text"
                        class="input input-bordered w-full"
                        value={formatCurrency(option.price)}
                        on:input={(e) => {
                          const rawValue = (e.target as HTMLInputElement).value;
                          const numericValue = parseCurrency(rawValue);
                          updateOption(variantIndex, optionIndex, 'price', numericValue);
                        }}
                        required
                      />
                    </div>
                    <div class="md:col-span-2 flex items-center justify-center gap-1">
                      <Button 
                        type="button" 
                        className="btn-error btn-circle btn-sm" 
                        on:click={() => removeOption(variantIndex, optionIndex)}
                        disabled={variant.options.filter(opt => !opt.delete).length <= 1}
                      >
                        x
                      </Button>
                      {#if optionIndex === variant.options.filter(opt => !opt.delete).length - 1}
                        <Button 
                          type="button" 
                          className="btn-info btn-outline btn-circle btn-sm" 
                          on:click={() => addOption(variantIndex)}
                        >
                          +
                        </Button>
                      {/if}
                    </div>
                  </div>
                {/if}
              {/each}
              
              {#if variant.options.filter(opt => !opt.delete).length === 0}
                <div class="text-sm text-warning">Varian ini belum memiliki opsi. Tambahkan opsi untuk melanjutkan.</div>
              {/if}
            </div>
          </div>
        {/if}
      {/each}
    {/if}

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