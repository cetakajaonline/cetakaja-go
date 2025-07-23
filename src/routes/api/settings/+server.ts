import { json } from "@sveltejs/kit";
import { getSetting, updateSetting } from "$lib/server/settingService";
import type { RequestHandler } from "./$types";
import { saveFile } from "$lib/server/uploadService"; // jika punya sistem upload
import { requireAnyRole, requireAdmin } from "$lib/server/auth";

export const GET: RequestHandler = async (event) => {
  requireAnyRole(event);
  const setting = await getSetting();
  return json(setting);
};

export const POST: RequestHandler = async (event) => {
  requireAdmin(event);
  const formData = await event.request.formData();

  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const file = formData.get("logo") as File | null;

  let logoUrl: string | undefined = undefined;

  if (file && file.size > 0) {
    const buffer = Buffer.from(await file.arrayBuffer());
    logoUrl = await saveFile(buffer, file.name); // atau simpan secara manual
  }

  const setting = await updateSetting({
    name,
    description,
    ...(logoUrl ? { logo: logoUrl } : {}),
  });

  return json(setting);
};
