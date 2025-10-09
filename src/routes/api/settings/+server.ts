import { json } from "@sveltejs/kit";
import { getSetting, updateSetting } from "$lib/server/settingService";
import type { RequestHandler } from "./$types";
import { saveFile } from "$lib/server/uploadService";
import { requireAnyRole, requireAdmin } from "$lib/server/auth";
import { settingSchema } from "$lib/validations/settingSchema";
import fs from 'fs';
import path from 'path';

export const GET: RequestHandler = async (event) => {
  requireAnyRole(event);

  const setting = await getSetting();
  return json(setting);
};

export const POST: RequestHandler = async (event) => {
  requireAdmin(event);

  const formData = await event.request.formData();

  const name = formData.get("name");
  const description = formData.get("description");
  const file = formData.get("logo");

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

  if (file instanceof File && file.size > 0) {
    const buffer = Buffer.from(await file.arrayBuffer());

    // Validasi ekstensi file di `saveFile`, atau lakukan di sini
    logoUrl = await saveFile(buffer, file.name); // saveFile bisa kembalikan `/uploads/filename`
  }

  // Get the old setting to access the old logo path
  const oldSetting = await getSetting();
  const oldLogoPath = oldSetting?.logo;
  
  const setting = await updateSetting({
    ...parsed.data,
    ...(logoUrl ? { logo: logoUrl } : {}),
  });

  // Delete the old logo file if it exists and a new one was uploaded
  if (oldLogoPath && logoUrl) {
    try {
      const fullPath = path.join(process.cwd(), 'static', oldLogoPath);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }
    } catch (err) {
      console.error(`Gagal menghapus file logo lama: ${oldLogoPath}`, err);
      // Continue even if file deletion fails
    }
  }

  return json(setting);
};
