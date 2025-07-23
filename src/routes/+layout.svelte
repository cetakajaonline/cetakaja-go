<script lang="ts">
  import "../app.css";
  export let data;
</script>

<svelte:head>
  <title>{data.title ?? data.appName ?? 'Nama Aplikasi'}</title>
  <meta property="og:title" content={data.title ?? data.appName ?? 'Nama Aplikasi'} />
  <meta name="description" content="{data.title ?? data.appDesc ?? 'Deskripsi Aplikasi'}" />
  {#if data.logo}
    <link rel="icon" href={data.logo} type="image/png" />
  {/if}
</svelte:head>

<slot />
