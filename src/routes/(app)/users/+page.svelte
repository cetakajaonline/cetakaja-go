<script lang="ts">
  import DefaultLayout from "$lib/layouts/DefaultLayout.svelte";
  import UserTable from "$lib/components/UserTable.svelte";
  import TableToolbar from "$lib/components/TableToolbar.svelte";
  import UserFormModal from "$lib/components/UserFormModal.svelte";
  import PageHeader from "$lib/components/PageHeader.svelte";
  import Pagination from "$lib/components/Pagination.svelte";
  import ConfirmModal from "$lib/components/ConfirmModal.svelte";
  import ValidationModal from "$lib/components/ValidationModal.svelte";

  import { userSchema, userUpdateSchema } from "$lib/validations/userSchema";
  import { z } from "zod";
  import { tick } from "svelte";
  import type { User } from "$lib/types";

  export let data: {
    users: User[];
    isAdmin: boolean;
    currentUserId: number;
  };

  const { users: initialUsers, isAdmin, currentUserId } = data;

  let users = [...initialUsers];
  let userToDelete: User | null = null;
  let selectedUser: User | null = null;
  let showUserModal = false;
  let isEditMode = false;
  let loading = false;
  let currentPage = 1;
  const pageSize = 7;
  const confirmModalId = "delete-user-confirm";
  let searchKeyword = "";
  let sortKey: keyof User = "name";
  let sortDirection: "asc" | "desc" = "asc";

  let userForm = {
    name: "",
    username: "",
    password: "",
    phone: "",
    address: "",
    role: "customer",
  };

  let validationMessages: string[] = [];
  let showValidationModal = false;

  function openAddModal() {
    isEditMode = false;
    selectedUser = null;
    userForm = { name: "", username: "", password: "", phone: "", address: "", role: "customer" };
    showUserModal = true;
  }

  function openEditModal(user: User) {
    isEditMode = true;
    selectedUser = user;
    userForm = {
      name: user.name,
      username: user.username,
      password: "",
      phone: user.phone ?? "",
      address: user.address ?? "",
      role: user.role ?? "customer",
    };
    showUserModal = true;
  }

  function closeFormModal() {
    showUserModal = false;
  }

  function closeValidationModal() {
    showValidationModal = false;
    validationMessages = [];
  }

  async function onSubmit(payload: typeof userForm) {
    loading = true;
    validationMessages = [];

    try {
      const schema = isEditMode ? userUpdateSchema : userSchema;
      const validated = schema.parse(payload);

      const endpoint =
        isEditMode && selectedUser
          ? `/api/users/${selectedUser.id}`
          : "/api/users";

      const method = isEditMode ? "PUT" : "POST";

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
      });

      const result = await res.json().catch(() => ({}));

      if (res.ok) {
        if (isEditMode && selectedUser) {
          users = users.map((u) =>
            u.id === selectedUser!.id ? { ...u, ...result } : u
          );
        } else {
          users = [...users, result];
        }
        closeFormModal();
      } else {
        closeFormModal();
        await tick(); // pastikan modal form sudah keluar sebelum tampilkan validation modal
        validationMessages = [
          result?.message || result?.error || "Gagal menyimpan data",
        ];
        showValidationModal = true;
      }
    } catch (err) {
      closeFormModal();
      await tick();
      if (err instanceof z.ZodError) {
        validationMessages = err.issues.map((e) => e.message);
      } else {
        validationMessages = ["Terjadi kesalahan saat mengirim data"];
      }
      showValidationModal = true;
    } finally {
      loading = false;
    }
  }

  async function onConfirmDelete() {
    if (!userToDelete) return;
    const res = await fetch(`/api/users/${userToDelete.id}`, {
      method: "DELETE",
    });
    if (res.ok) {
      users = users.filter((u) => u.id !== userToDelete?.id);
    }
    userToDelete = null;
  }

  function askDelete(user: User) {
    userToDelete = user;
    setTimeout(() => {
      document.getElementById(confirmModalId)?.click();
    }, 0);
  }

  function handleSearch(keyword: string) {
    searchKeyword = keyword.toLowerCase();
    currentPage = 1;
  }

  function paginate(array: User[], page: number, size: number) {
    const start = (page - 1) * size;
    return array.slice(start, start + size);
  }

  function toggleSort(key: keyof User) {
    if (sortKey === key) {
      sortDirection = sortDirection === "asc" ? "desc" : "asc";
    } else {
      sortKey = key;
      sortDirection = "asc";
    }
  }

  $: filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchKeyword) ||
      u.username.toLowerCase().includes(searchKeyword)
  );

  $: sortedUsers = [...filteredUsers].sort((a, b) => {
    const aVal = a[sortKey] ?? "";
    const bVal = b[sortKey] ?? "";
    if (typeof aVal === "string" && typeof bVal === "string") {
      return sortDirection === "asc"
        ? aVal.localeCompare(bVal)
        : bVal.localeCompare(aVal);
    }
    return 0;
  });

  $: paginatedUsers = paginate(sortedUsers, currentPage, pageSize);
</script>

<DefaultLayout title="Users">
  <PageHeader
    title="Users"
    icon="👤"
    showAddButton={isAdmin}
    addLabel="Tambah"
    onAdd={openAddModal}
  />

  <TableToolbar on:search={(e) => handleSearch(e.detail)} />

  <UserTable
    users={paginatedUsers}
    onEdit={(user) => {
      if (isAdmin || user.id === currentUserId) openEditModal(user);
    }}
    onDelete={(user) => isAdmin && askDelete(user)}
    onSort={toggleSort}
    {sortKey}
    {sortDirection}
    {isAdmin}
    {currentUserId}
  />

  <Pagination
    totalItems={filteredUsers.length}
    {currentPage}
    {pageSize}
    onPageChange={(p) => (currentPage = p)}
  />

  <UserFormModal
    show={showUserModal}
    {isEditMode}
    {loading}
    initial={userForm}
    {isAdmin}
    on:submit={(e) => onSubmit(e.detail)}
    on:close={closeFormModal}
  />

  <ValidationModal
    show={showValidationModal}
    title="Validasi Gagal"
    messages={validationMessages}
    onClose={closeValidationModal}
  />

  {#if isAdmin}
    <ConfirmModal
      id={confirmModalId}
      title="Hapus User"
      message={`Yakin ingin menghapus ${userToDelete?.name}?`}
      confirmText="Hapus"
      confirmClass="btn-outline btn-error"
      cancelText="Batal"
      cancelClass="btn-outline btn-warning"
      onConfirm={onConfirmDelete}
    />
  {/if}
</DefaultLayout>
