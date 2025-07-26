import type { RequestEvent } from "@sveltejs/kit";

/**
 * Pastikan user sudah login
 */
export function requireAuth(event: RequestEvent) {
  if (!event.locals.user) {
    throw new Error("Unauthorized : user tidak ditemukan");
  }
}

/**
 * Pastikan user memiliki peran tertentu
 */
export function requireRole(event: RequestEvent, role: string) {
  requireAuth(event);
  const userRole = event.locals.user?.role;

  if (userRole !== role) {
    throw new Error(
      `Forbidden : hanya role ${role} yang diperbolehkan (saat ini: ${userRole})`
    );
  }
}

/**
 * Hanya untuk admin
 */
export function requireAdmin(event: RequestEvent) {
  requireRole(event, "admin");
}

/**
 * Hanya boleh akses jika admin, atau jika id milik dirinya sendiri
 */
export function requireRoleOrSelf(
  event: RequestEvent,
  userId: number,
  role: string = "admin"
) {
  requireAuth(event);

  const currentUser = event.locals.user;
  if (currentUser?.role === role) return;

  if (currentUser?.id !== userId) {
    throw new Error("Forbidden: Anda tidak boleh mengakses data user lain");
  }
}

/**
 * Pastikan user memiliki role apapun
 * Digunakan untuk endpoint yang tidak memerlukan role khusus
 */
export function requireAnyRole(event: { locals: App.Locals }) {
  const user = event.locals.user;
  if (!user || !user.role) {
    throw new Error("Role is required");
  }
}

/**
 * Cek apakah user adalah admin
 * Digunakan untuk endpoint yang hanya boleh diakses oleh admin
 */
export function isAdmin(event: RequestEvent): boolean {
  return event.locals.user?.role === "admin";
}
