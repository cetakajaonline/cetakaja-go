import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { verifyJwt } from '$lib/server/jwt';

export const load: PageServerLoad = ({ locals, cookies }) => {
  // Check authentication
  const token = cookies.get('token');

  if (!locals.user && !token) {
    throw redirect(302, '/login');
  }

  // If no locals.user but we have a token, try to verify it
  if (!locals.user && token) {
    const decoded = verifyJwt<{ userId: number; role: string }>(token);
    if (!decoded) {
      throw redirect(302, '/login');
    }
  }

  // Check user role (only admin and staff can access reports)
  if (locals.user && !['admin', 'staff'].includes(locals.user.role)) {
    throw redirect(302, '/dashboard');
  }

  return {
    user: locals.user,
    isAdmin: locals.user?.role === 'admin',
    isStaff: locals.user?.role === 'staff'
  };
};