<script lang="ts">
  import "../app.css";
	export let data;
</script>

<svelte:head>
  <title>{data.title ?? 'Billing App'}</title>
  <meta name="description" content="Aplikasi billing untuk kasir dan manajemen." />
  <meta property="og:title" content={data.title} />
</svelte:head>

<slot />