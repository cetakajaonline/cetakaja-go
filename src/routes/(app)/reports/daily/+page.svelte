<script lang="ts">
  import DefaultLayout from "$lib/layouts/DefaultLayout.svelte";
  import PageHeader from "$lib/components/PageHeader.svelte";
</script>

<DefaultLayout title="Daily Report">
  <PageHeader title="Laporan Harian" icon="📅" />
  
  <div class="alert alert-info">
    <div>
      <span>Sedang dalam perbaikan...</span>
    </div>
  </div>
</DefaultLayout>