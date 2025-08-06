// src/routes/+layout.server.ts
import type { LayoutServerLoad } from "./$types";
import prisma from "$lib/server/prisma";

export const load: LayoutServerLoad = async ({ url, locals }) => {
  const setting = await prisma.setting.findFirst();
  const appName = setting?.name ?? "Nama Aplikasi";
  const appDesc = setting?.name ?? "Deskripsi Aplikasi";
  const appLogo = setting?.logo ?? null;

  // Mapping pathname ke judul halaman
  const titles: Record<string, string> = {
    "/": "Home",
    "/login": "Login",
    "/dashboard": "Dashboard",
    "/items": "Items",
    "/users": "Users",
    "/token": "API Keys",
    "/settings": "Settings",
  };

  const pageTitle = titles[url.pathname] ?? "";
  const title = pageTitle ? `${pageTitle} | ${appName}` : appName;

  return {
    title, appName, appDesc, appLogo, user: locals.user ?? null,
    tokens: [],
    items: [],
  };
};
