export async function createKey(data: {
  name: string;
  token: string;
  createdBy: number;
}) {
  const res = await fetch("/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw new Error("Gagal membuat token");
  }

  return await res.json();
}

export async function updateKey(
  id: number,
  data: {
    name?: string;
    revoked?: boolean;
  }
) {
  const res = await fetch(`/api/token/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw new Error("Gagal memperbarui token");
  }

  return await res.json();
}

export async function deleteKey(id: number) {
  const res = await fetch(`/api/token/${id}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    throw new Error("Gagal menghapus token");
  }

  return true;
}

export async function getKey(id: number) {
  const res = await fetch(`/api/token/${id}`);

  if (!res.ok) {
    throw new Error("Gagal mengambil token");
  }

  return await res.json();
}
