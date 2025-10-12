<script lang="ts">
  import "../app.css";
  export let data;
</script>

<svelte:head>
  <title>{data.title ?? data.appName ?? 'Cetak Aja Online'}</title>
  <meta property="og:title" content={data.title ?? data.appName ?? 'Cetak Aja Online'} />
  <meta name="description" content="{data.title ?? data.appDesc ?? 'Aplikasi Point of Sale untuk Percetakan Dan Digital Printing'}" />
  {#if data.appLogo}
    <link rel="icon" href={data.appLogo} type="image/png" />
  {/if}
</svelte:head>

<slot />
