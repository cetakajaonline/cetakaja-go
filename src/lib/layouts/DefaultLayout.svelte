<script lang="ts">
  export let title: string = 'Dashboard';
</script>

<div class="min-h-screen flex flex-col bg-base-100">
  <!-- Breadcrumb -->
  <div class="w-full border-b border-base-200 bg-base-100 sticky top-0 z-30">
    <div class="w-full p-4">
      <div class="text-sm breadcrumbs text-base-content">
        <ul class="flex gap-1">
          <li><a href="/admin">🏠 Beranda</a></li>
          {#if title && title !== 'Dashboard'}
            <li class="font-semibold text-base-content">{title}</li>
          {/if}
        </ul>
      </div>
    </div>
  </div>

  <!-- Main Content -->
  <main class="flex-1 w-full px-2 py-3">
    <div class="w-full p-4">
      <slot />
    </div>
  </main>

  <!-- Footer -->
  <footer class="text-center text-xs text-base-content/60 py-2 border-t border-base-200">
    © {new Date().getFullYear()} Billing App — All rights reserved.
  </footer>
</div>
