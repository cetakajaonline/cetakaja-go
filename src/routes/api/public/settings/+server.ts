// src/routes/api/public/settings/+server.ts
import { json } from "@sveltejs/kit";
import { getSettings } from "$lib/server/settingService";
import type { RequestHandler } from "./$types";

// GET: Public endpoint to get settings
export const GET: RequestHandler = async () => {
  try {
    const settings = await getSettings();
    // Return only public settings (excluding sensitive information)
    const publicSettings = {
      name: settings?.name || null,
      description: settings?.description || null,
      logo: settings?.logo || null,
      bankName: settings?.bankName || null,
      bankAccountName: settings?.bankAccountName || null,
      bankAccountNumber: settings?.bankAccountNumber || null,
      // Don't include sensitive info like passwords or API keys
    };
    
    return json(publicSettings);
  } catch (error) {
    console.error('Error fetching public settings:', error);
    return json({ message: "Gagal mengambil data pengaturan" }, { status: 500 });
  }
};