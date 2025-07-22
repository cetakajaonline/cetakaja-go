<script lang="ts">
  import type { User } from '$lib/types';
  export let user: User | null = null;
  export let onClose: () => void;
</script>

<div class={`fixed top-0 right-0 h-full w-full sm:w-[400px] bg-base-100 shadow-lg z-50 transition-transform duration-300 ${user ? 'translate-x-0' : 'translate-x-full'}`}>
  <div class="flex justify-between items-center p-4 border-b">
    <h3 class="text-lg font-semibold">Detail Pengguna</h3>
    <button class="btn btn-sm btn-ghost" on:click={onClose}>✕</button>
  </div>

  {#if user}
    <div class="p-4 space-y-3">
      <div class="flex items-center gap-3">
        <div class="avatar">
          <div class="w-12 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
            <img src={user.photo || '/uploads/1753065267074.png'} alt={user.name} />
          </div>
        </div>
        <div>
          <h4 class="font-semibold">{user.name}</h4>
          <p class="text-sm text-base-content/70">{user.email}</p>
        </div>
      </div>

      <div><strong>Role:</strong> Admin</div>
      <div><strong>Status:</strong> Online</div>
      <div><strong>Alamat:</strong> Serang</div>
      <div><strong>No. HP:</strong> 0819678048</div>
      <!-- Tambahkan field lainnya jika ada -->
    </div>
  {/if}
</div>
