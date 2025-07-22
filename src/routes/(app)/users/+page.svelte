<script lang="ts">
  import DefaultLayout from '$lib/layouts/DefaultLayout.svelte';
  import UserTable from '$lib/components/UserTable.svelte';
  import TableToolbar from '$lib/components/TableToolbar.svelte';
  import UserFormModal from '$lib/components/UserFormModal.svelte';
  import PageHeader from '$lib/components/PageHeader.svelte';
  import UserDrawer from '$lib/components/UserDrawer.svelte';
  import Pagination from '$lib/components/Pagination.svelte';
  import ConfirmModal from '$lib/components/ConfirmModal.svelte';

  import type { User } from '$lib/types';

  export let data: { users: User[] };

  let userToDelete: User | null = null;
  const confirmModalId = 'delete-user-confirm';

  let users: User[] = [];
  if (data && Array.isArray(data.users)) {
    users = data.users;
  }
  let selectedUser: User | null = null;

  let showUserModal = false;
  let isEditMode = false;
  let loading = false;

  // Form data (tanpa file)
  let userForm = {
    name: '',
    email: '',
    password: '',
    photo: '', // <--- harus ada untuk menghindari error TS
  };

  // File disimpan terpisah
  let file: File | null = null;

  function openAddModal() {
    isEditMode = false;
    selectedUser = null;
    userForm = {
      name: '',
      email: '',
      password: '',
      photo: ''
    };
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
      photo: user.photo ?? ''
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
  }) {
    loading = true;

    try {
      const res = await fetch(
        isEditMode && selectedUser
          ? `/api/users/${selectedUser.id}`
          : '/api/users',
        {
          method: isEditMode ? 'PUT' : 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        }
      );

      let result: any;
      try {
        result = await res.json();
      } catch {
        result = {};
      }

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
    } catch (err) {
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

    // buka modal dengan klik programatik checkbox-nya
    setTimeout(() => {
      document.getElementById(confirmModalId)?.click();
    }, 0);
  }


  let searchKeyword = '';
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
  $: if (searchKeyword || sortKey || sortDirection) {
    currentPage = 1;
  }

  function handleSearch(keyword: string) {
    searchKeyword = keyword.toLowerCase();
    currentPage = 1;
  }

  function openDrawer(user: User) {
    selectedUser = user;
  }

  function closeDrawer() {
    selectedUser = null;
  }

  let currentPage = 1;
  const pageSize = 7;

  function paginate(array: User[], page: number, size: number) {
    const start = (page - 1) * size;
    return array.slice(start, start + size);
  }

  let sortKey: keyof User = 'name';
  let sortDirection: 'asc' | 'desc' = 'asc';

  function toggleSort(key: keyof User) {
    if (sortKey === key) {
      sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      sortKey = key;
      sortDirection = 'asc';
    }
  }
</script>

<DefaultLayout title="Pengguna">
  <PageHeader
    title="Pengguna"
    icon="👤"
    showAddButton
    addLabel="Tambah Pengguna"
    onAdd={openAddModal}
  />

  <TableToolbar on:search={(e) => handleSearch(e.detail)} />

  <!-- Pakai // onRowClick={(user) => openDrawer(user)} Buat Detail-->
  <UserTable
    users={paginatedUsers}
    onEdit={(user) => openEditModal(user)}
    onDelete={(user) => askDelete(user)}
    onSort={toggleSort}
    sortKey={sortKey}
    sortDirection={sortDirection}
  />
  
  <Pagination
    totalItems={filteredUsers.length}
    {currentPage}
    {pageSize}
    onPageChange={(p) => currentPage = p}
  />
  
  <!-- Pakai UserDrawer user={selectedUser} onClose={closeDrawer} /-->

  <UserFormModal
    show={showUserModal}
    {isEditMode}
    {loading}
    initial={userForm}
    on:submit={(e) => onSubmit(e.detail)}
    on:close={() => showUserModal = false}
  />

  <ConfirmModal
    id={confirmModalId}
    title="Hapus Pengguna"
    message={`Yakin ingin menghapus ${userToDelete?.name}?`}
    confirmText="Hapus"
    confirmClass="btn-outline btn-error"
    cancelText="Batal"
    cancelClass="btn-outline btn-warning"
    onConfirm={onConfirmDelete}
  />
</DefaultLayout>
