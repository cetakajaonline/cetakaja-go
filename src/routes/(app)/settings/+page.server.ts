import { getSetting } from "$lib/server/settingService";

import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async (event) => {
  const user = event.locals.user;
  const setting = await getSetting();
  return { setting, user };
};

