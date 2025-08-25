// src/routes/(app)/+layout.server.ts
import { redirect } from "@sveltejs/kit";
import prisma from "$lib/server/prisma";
import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async ({ locals }) => {
  // Redirect jika belum login
  if (!locals.user) {
    throw redirect(302, "/login");
  }

  // Ambil setting sekali saja
  const settings = await prisma.setting.findFirst({
    select: {
      name: true,
      description: true,
      logo: true,
    },
  });

  return {
    user: locals.user,
    setting: {
      name: settings?.name ?? "Aplikasi",
      description: settings?.description ?? "",
      logo: settings?.logo ?? null,
    },
  };
};
