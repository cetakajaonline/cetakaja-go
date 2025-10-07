import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { saveFile } from "$lib/server/uploadService";
import { requireAdmin } from "$lib/server/auth";

export const POST: RequestHandler = async (event) => {
  requireAdmin(event);

  const formData = await event.request.formData();
  const file = formData.get("photo");

  if (!file || !(file instanceof File)) {
    return json({ message: "File foto tidak ditemukan" }, { status: 400 });
  }

  // Validasi ukuran file (maks 5MB)
  if (file.size > 5 * 1024 * 1024) {
    return json({ message: "Ukuran file terlalu besar (maks 5MB)" }, { status: 400 });
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const photoPath = await saveFile(buffer, file.name);
    return json({ photoPath });
  } catch (error) {
    console.error("Upload error:", error);
    return json({ message: "Gagal mengupload foto" }, { status: 500 });
  }
};