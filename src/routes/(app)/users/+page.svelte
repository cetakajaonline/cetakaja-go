<script lang="ts">
  import DefaultLayout from '$lib/layouts/DefaultLayout.svelte';
  import UserTable from '$lib/components/UserTable.svelte';
  import TableToolbar from '$lib/components/TableToolbar.svelte';
  import UserFormModal from '$lib/components/UserFormModal.svelte';
  import PageHeader from '$lib/components/PageHeader.svelte';
  import Pagination from '$lib/components/Pagination.svelte';
  import ConfirmModal from '$lib/components/ConfirmModal.svelte';

  import type { User } from '$lib/types';

  export let data: {
    users: User[];
    isAdmin: boolean;
    currentUserId: number;
  };

  const { users: initialUsers, isAdmin, currentUserId } = data;

  let users: User[] = [...initialUsers];
  let userToDelete: User | null = null;
  let selectedUser: User | null = null;
  let showUserModal = false;
  let isEditMode = false;
  let loading = false;
  let currentPage = 1;
  const pageSize = 7;
  const confirmModalId = 'delete-user-confirm';
  let searchKeyword = '';
  let sortKey: keyof User = 'name';
  let sortDirection: 'asc' | 'desc' = 'asc';

  let userForm = {
    name: '',
    email: '',
    password: '',
    photo: '',
    role: 'user'
  };
  let file: File | null = null;

  function openAddModal() {
    isEditMode = false;
    selectedUser = null;
    userForm = { name: '', email: '', password: '', photo: '', role: 'user' };
    file = null;
    showUserModal = true;
  }

  function openEditModal(user: User) {
    isEditMode = true;
    selectedUser = user;
    userForm = {
      name: user.name,
      email: user.email,
      password: '',
      photo: user.photo ?? '',
      role: user.role ?? 'user'
    };
    file = null;
    showUserModal = true;
  }

  function onClose() {
    showUserModal = false;
  }

  async function onSubmit(payload: {
    name: string;
    email: string;
    password: string;
    photo: string;
    role: string;
  }) {
    loading = true;

    try {
      const { name, email, password, photo, role } = payload;
      const finalPayload = isAdmin
        ? { name, email, password, photo, role }
        : { name, email, password, photo };

      const res = await fetch(
        isEditMode && selectedUser
          ? `/api/users/${selectedUser.id}`
          : '/api/users',
        {
          method: isEditMode ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(finalPayload),
        }
      );

      const result = await res.json().catch(() => ({}));
      const selectedId = selectedUser?.id;

      if (res.ok) {
        if (isEditMode && selectedId) {
          users = users.map(u =>
            u.id === selectedId ? { ...u, ...result } : u
          );
        } else {
          users = [...users, result];
        }
        onClose();
      } else {
        alert(result?.message || result?.error || 'Gagal menyimpan data');
      }
    } catch {
      alert('Terjadi kesalahan saat mengirim data');
    } finally {
      loading = false;
    }
  }

  async function onConfirmDelete() {
    if (!userToDelete) return;

    const res = await fetch(`/api/users/${userToDelete.id}`, {
      method: 'DELETE'
    });

    if (res.ok) {
      users = users.filter(u => u.id !== userToDelete?.id);
    } else {
      alert('Gagal menghapus user');
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
      sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      sortKey = key;
      sortDirection = 'asc';
    }
  }

  // Reactive values
  $: filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(searchKeyword) ||
    u.email.toLowerCase().includes(searchKeyword)
  );

  $: sortedUsers = [...filteredUsers].sort((a, b) => {
    const aVal = a[sortKey] ?? '';
    const bVal = b[sortKey] ?? '';
    if (typeof aVal === 'string' && typeof bVal === 'string') {
      return sortDirection === 'asc'
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
    addLabel="Tambah User"
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
    sortKey={sortKey}
    sortDirection={sortDirection}
    isAdmin={isAdmin}
    currentUserId={currentUserId}
  />

  <Pagination
    totalItems={filteredUsers.length}
    {currentPage}
    {pageSize}
    onPageChange={(p) => currentPage = p}
  />

  <UserFormModal
    show={showUserModal}
    {isEditMode}
    {loading}
    initial={userForm}
    isAdmin={isAdmin}
    on:submit={(e) => onSubmit(e.detail)}
    on:close={onClose}
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
