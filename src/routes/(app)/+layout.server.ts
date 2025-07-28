// src/routes/(app)/+layout.server.ts
import { redirect } from "@sveltejs/kit";
import prisma from "$lib/server/prisma";
import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async ({ locals }) => {
  if (!locals.user) throw redirect(302, "/login");

  const settings = await prisma.setting.findFirst({
    select: {
      name: true,
      logo: true,
    },
  });

  return {
    appName: settings?.name ?? "Aplikasi",
    appLogo: settings?.logo ?? null,
    user: locals.user,
  };
};
