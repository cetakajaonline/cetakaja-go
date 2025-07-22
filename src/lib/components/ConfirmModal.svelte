<script lang="ts">
  export let id = 'confirm-modal'; // unique ID for modal toggle
  export let title = 'Konfirmasi';
  export let message = 'Apakah Anda yakin ?';
  export let confirmText = 'OK';
  export let cancelText = 'Batal';
  export let confirmClass = 'btn-error'; // style variant
  export let cancelClass = 'btn-ghost';  // style variant
  export let onConfirm: () => void = () => {};
</script>

<input type="checkbox" id={id} class="modal-toggle" />
<div class="modal" role="dialog">
  <div class="modal-box animate-fade-in">
    <h3 class="font-bold text-lg">{title}</h3>
    <p class="py-4">{message}</p>
    <div class="modal-action">
      <button
        class={`btn ${confirmClass}`}
        on:click={() => {
          onConfirm();
          document.getElementById(id)?.click(); // close modal
        }}
      >
        {confirmText}
      </button>
      <label for={id} class={`btn ${cancelClass}`}>{cancelText}</label>
    </div>
  </div>
</div>
