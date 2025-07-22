<!-- layouts/AuthLayout.svelte -->
<script>
  export let title = 'Login';
</script>

<div class="min-h-screen flex items-center justify-center bg-base-200">
  <div class="w-full max-w-md p-6 shadow-lg bg-base-100 rounded-xl">
    <h1 class="text-xl font-bold text-center">{title}</h1>
    <slot />
  </div>
</div>
