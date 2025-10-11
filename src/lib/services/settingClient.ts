// src/lib/services/settingClient.ts
import type { Setting } from "$lib/types";

// Get current setting
export async function getSettings(): Promise<{
  success: boolean;
  data?: Setting;
  message?: string;
}> {
  try {
    const response = await fetch("/api/settings");
    if (!response.ok) {
      throw new Error("Gagal mengambil pengaturan");
    }
    const data = await response.json();
    return { success: true, data };
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Gagal mengambil pengaturan";
    return { success: false, message: errorMessage };
  }
}

// Update setting (with logo and payment instruction support)
export async function updateSetting(
  name: string,
  description: string,
  logoFile?: File | null,
  bankName?: string,
  bankCode?: string,
  bankAccountNumber?: string,
  bankAccountName?: string,
  qrisImageFile?: File | null,
  cashPaymentInstruction?: string,
  qrisPaymentInstruction?: string,
  bankTransferInstruction?: string,
): Promise<{ success: boolean; data?: Setting; message?: string }> {
  try {
    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);

    if (bankName !== undefined) formData.append("bankName", bankName);
    if (bankCode !== undefined) formData.append("bankCode", bankCode);
    if (bankAccountNumber !== undefined)
      formData.append("bankAccountNumber", bankAccountNumber);
    if (bankAccountName !== undefined)
      formData.append("bankAccountName", bankAccountName);
    if (cashPaymentInstruction !== undefined)
      formData.append("cashPaymentInstruction", cashPaymentInstruction);
    if (qrisPaymentInstruction !== undefined)
      formData.append("qrisPaymentInstruction", qrisPaymentInstruction);
    if (bankTransferInstruction !== undefined)
      formData.append("bankTransferInstruction", bankTransferInstruction);

    if (logoFile) {
      formData.append("logo", logoFile);
    }

    if (qrisImageFile) {
      formData.append("qrisImage", qrisImageFile);
    }

    const response = await fetch("/api/settings", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Gagal mengupdate pengaturan");
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Gagal mengupdate pengaturan";
    return { success: false, message: errorMessage };
  }
}
