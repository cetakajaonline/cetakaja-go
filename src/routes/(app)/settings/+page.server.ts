import { getSettings } from "$lib/server/settingService";
import { redirect } from "@sveltejs/kit";

import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async (event) => {
  const user = event.locals.user;
  if (!user) {
    throw redirect(302, "/login");
  }

  const isAdmin = user.role === "admin";

  if (!isAdmin) {
    // Only admins can access categories page
    throw redirect(302, "/dashboard");
  }

  const setting = await getSettings();
  return { setting, user };
};
