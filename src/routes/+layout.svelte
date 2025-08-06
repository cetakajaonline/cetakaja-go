<script lang="ts">
  import "../app.css";
  export let data;
</script>

<svelte:head>
  <title>{data.title ?? data.appName ?? 'Nama Aplikasi'}</title>
  <meta property="og:title" content={data.title ?? data.appName ?? 'Nama Aplikasi'} />
  <meta name="description" content="{data.title ?? data.appDesc ?? 'Deskripsi Aplikasi'}" />
  {#if data.appLogo}
    <link rel="icon" href={data.appLogo} type="image/png" />
  {/if}
</svelte:head>

<slot />
