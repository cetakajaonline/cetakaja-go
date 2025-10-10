// src/routes/+layout.server.ts
import type { LayoutServerLoad } from "./$types";
import type { User } from "$lib/types";
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
    "/users": "Users",
    "/orders": "Orders",
    "/products": "Products",
    "/settings": "Settings",
  };

  const pageTitle = titles[url.pathname] ?? "";
  const title = pageTitle ? `${pageTitle} | ${appName}` : appName;

  // Kita perlu menyediakan 'users' karena diperlukan oleh PageData
  // Untuk efisiensi, kita hanya mengambil user yang relevan di halaman tertentu
  // Di layout utama, kita bisa kembalikan array kosong dan biarkan halaman individual menangani data users
  const users: User[] = [];

  return {
    title,
    appName,
    appDesc,
    appLogo,
    user: locals.user ?? undefined,
    users,
  };
};

