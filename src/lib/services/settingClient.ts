// src/lib/services/settingClient.ts
import type { Setting } from "$lib/types";

// Get current setting
export async function getSetting(): Promise<Setting> {
  const response = await fetch("/api/settings");
  if (!response.ok) {
    throw new Error("Gagal mengambil pengaturan");
  }
  return response.json() as Promise<Setting>;
}

// Update setting (with logo upload support)
export async function updateSetting(
  name: string,
  description: string,
  logoFile?: File | null,
): Promise<Setting> {
  const formData = new FormData();
  formData.append("name", name);
  formData.append("description", description);

  if (logoFile) {
    formData.append("logo", logoFile);
  }

  const response = await fetch("/api/settings", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Gagal mengupdate pengaturan");
  }

  return response.json() as Promise<Setting>;
}

