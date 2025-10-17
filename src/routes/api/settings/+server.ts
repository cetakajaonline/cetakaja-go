import { json } from "@sveltejs/kit";
import { getSettings, updateSetting } from "$lib/server/settingService";
import type { RequestHandler } from "./$types";
import { saveLogoFile, saveQrisImageFile } from "$lib/server/uploadService";
import { requireAnyRole, requireAdmin } from "$lib/server/auth";
import { settingSchema } from "$lib/validations/settingSchema";
import type { Setting } from "npm:@prisma/client";
import fs from "node:fs";
import path from "node:path";

export const GET: RequestHandler = async (event) => {
  requireAnyRole(event);

  const setting = await getSettings();
  return json(setting);
};

export const POST: RequestHandler = async (event) => {
  requireAdmin(event);

  const formData = await event.request.formData();

  const name = formData.get("name");
  const description = formData.get("description");
  const bankName = formData.get("bankName");
  const bankCode = formData.get("bankCode");
  const bankAccountNumber = formData.get("bankAccountNumber");
  const bankAccountName = formData.get("bankAccountName");

  const logoFile = formData.get("logo");
  const qrisImageFile = formData.get("qrisImage");

  if (typeof name !== "string" || typeof description !== "string") {
    throw new Error("Name dan Description wajib diisi");
  }

  // Ensure all bank fields are properly converted to strings if they exist
  const bankNameStr =
    bankName instanceof File ? undefined : String(bankName || "");
  const bankCodeStr =
    bankCode instanceof File ? undefined : String(bankCode || "");
  const bankAccountNumberStr =
    bankAccountNumber instanceof File
      ? undefined
      : String(bankAccountNumber || "");
  const bankAccountNameStr =
    bankAccountName instanceof File ? undefined : String(bankAccountName || "");

  // Validasi teks pakai Zod
  const parsed = settingSchema.safeParse({
    name,
    description,
    bankName:
      bankNameStr && bankNameStr.trim() !== "" ? bankNameStr : undefined,
    bankCode:
      bankCodeStr && bankCodeStr.trim() !== "" ? bankCodeStr : undefined,
    bankAccountNumber:
      bankAccountNumberStr && bankAccountNumberStr.trim() !== ""
        ? bankAccountNumberStr
        : undefined,
    bankAccountName:
      bankAccountNameStr && bankAccountNameStr.trim() !== ""
        ? bankAccountNameStr
        : undefined,
  });

  if (!parsed.success) {
    return json(
      {
        message: "Validasi gagal",
        errors: parsed.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }

  let logoUrl: string | undefined;
  let qrisImageUrl: string | undefined;

  if (logoFile instanceof File && logoFile.size > 0) {
    const buffer = Buffer.from(await logoFile.arrayBuffer());

    // Save logo to the dedicated 'logo' folder
    logoUrl = await saveLogoFile(buffer, logoFile.name);
  }

  if (qrisImageFile instanceof File && qrisImageFile.size > 0) {
    const buffer = Buffer.from(await qrisImageFile.arrayBuffer());

    // Save QRIS image to the dedicated 'qris' folder
    qrisImageUrl = await saveQrisImageFile(buffer, qrisImageFile.name);
  }

  // Get the old setting to access the old logo path
  const oldSetting: Setting | null = await getSettings();
  const oldLogoPath = oldSetting?.logo;
  const oldQrisImagePath = oldSetting?.qrisImage;

  // Prepare update data
  // Separate the known fields from the new fields
  const knownFields = {
    ...parsed.data,
    ...(logoUrl ? { logo: logoUrl } : {}),
  };

  const newFields = {
    ...(bankNameStr && bankNameStr.trim() !== ""
      ? { bankName: bankNameStr }
      : {}),
    ...(bankCodeStr && bankCodeStr.trim() !== ""
      ? { bankCode: bankCodeStr }
      : {}),
    ...(bankAccountNumberStr && bankAccountNumberStr.trim() !== ""
      ? { bankAccountNumber: bankAccountNumberStr }
      : {}),
    ...(bankAccountNameStr && bankAccountNameStr.trim() !== ""
      ? { bankAccountName: bankAccountNameStr }
      : {}),
    ...(qrisImageUrl ? { qrisImage: qrisImageUrl } : {}),
  };

  // Combine all fields
  const updateData = {
    ...knownFields,
    ...newFields,
  };

  const setting = await updateSetting(updateData);

  // Delete the old logo file if it exists and a new one was uploaded
  if (oldLogoPath && logoUrl) {
    try {
      const fullPath = path.join(process.cwd(), "static", oldLogoPath);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }
    } catch (err) {
      console.error(`Gagal menghapus file logo lama: ${oldLogoPath}`, err);
      // Continue even if file deletion fails
    }
  }

  // Delete the old QRIS image file if it exists and a new one was uploaded
  if (oldQrisImagePath && qrisImageUrl) {
    try {
      const fullPath = path.join(process.cwd(), "static", oldQrisImagePath);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }
    } catch (err) {
      console.error(`Gagal menghapus file QRIS lama: ${oldQrisImagePath}`, err);
      // Continue even if file deletion fails
    }
  }

  return json(setting);
};
