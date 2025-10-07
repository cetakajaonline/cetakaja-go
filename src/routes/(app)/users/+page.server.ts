// src/routes/users/+page.server.ts
import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { getAllUsers, getUserById } from '$lib/server/userService';
import type { User } from '$lib/types';

export const load: PageServerLoad = async (event) => {
  const user = event.locals.user;
  if (!user) {
    throw redirect(302, '/login');
  }

  const isAdmin = user.role === 'admin';
  let users: User[] = [];

  if (isAdmin) {
    const all = await getAllUsers();
    users = all.map((u) => ({
      ...u,
      createdAt: u.createdAt.toISOString(),
    }));
  } else {
    const self = await getUserById(user.id);
    if (self) {
      users = [{
        ...self,
        createdAt: self.createdAt.toISOString(),
      }];
    }
  }

  return {
    users,
    isAdmin,
    currentUserId: user.id,
  };
};
