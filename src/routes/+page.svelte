<script lang="ts">
  import AuthLayout from '$lib/layouts/AuthLayout.svelte';
  import LoginForm from '$lib/components/LoginForm.svelte';

  function handleSuccess() {
    window.location.href = '/dashboard';
  }
</script>

<AuthLayout title="Login">
  <LoginForm on:success={handleSuccess} />
</AuthLayout>