import { json } from "@sveltejs/kit";
import { getSettings, updateSetting } from "$lib/server/settingService";
import type { RequestHandler } from "./$types";
import { saveLogoFile, saveQrisImageFile } from "$lib/server/uploadService";
import { requireAnyRole, requireAdmin } from "$lib/server/auth";
import { settingSchema } from "$lib/validations/settingSchema";
import type { Setting } from "@prisma/client";
import fs from "fs";
import path from "path";

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
  const cashPaymentInstruction = formData.get("cashPaymentInstruction");
  const qrisPaymentInstruction = formData.get("qrisPaymentInstruction");
  const bankTransferInstruction = formData.get("bankTransferInstruction");
  const logoFile = formData.get("logo");
  const qrisImageFile = formData.get("qrisImage");

  if (typeof name !== "string" || typeof description !== "string") {
    throw new Error("Name dan Description wajib diisi");
  }

  // Validasi teks pakai Zod
  const parsed = settingSchema.safeParse({ name, description });

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
    ...(typeof bankName === "string" && bankName.trim() !== ""
      ? { bankName }
      : {}),
    ...(typeof bankCode === "string" && bankCode.trim() !== ""
      ? { bankCode }
      : {}),
    ...(typeof bankAccountNumber === "string" && bankAccountNumber.trim() !== ""
      ? { bankAccountNumber }
      : {}),
    ...(typeof bankAccountName === "string" && bankAccountName.trim() !== ""
      ? { bankAccountName }
      : {}),
    ...(typeof cashPaymentInstruction === "string"
      ? { cashPaymentInstruction }
      : {}),
    ...(typeof qrisPaymentInstruction === "string"
      ? { qrisPaymentInstruction }
      : {}),
    ...(typeof bankTransferInstruction === "string"
      ? { bankTransferInstruction }
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
