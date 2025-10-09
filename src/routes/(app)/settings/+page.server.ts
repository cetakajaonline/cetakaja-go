import { getSetting } from "$lib/server/settingService";

export async function load(event: any) {
  const user = event.locals.user;
  const setting = await getSetting();
  return { setting, user };
}
