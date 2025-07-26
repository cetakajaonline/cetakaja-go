import type { PageServerLoad } from "./$types";
import { redirect } from "@sveltejs/kit";
import { getAllUsers, getUserById } from "$lib/server/userService";
import type { User } from "$lib/types"; // Bukan dari Prisma

export const load: PageServerLoad = async (event) => {
  const user = event.locals.user;

  if (!user) {
    // eslint-disable-next-line @typescript-eslint/only-throw-error
    throw redirect(302, "/login");
  }

  const isAdmin = user.role === "admin";

  let users: User[] = [];

  if (isAdmin) {
    const rawUsers = await getAllUsers();
    users = rawUsers.map((u) => ({
      ...u,
      photo: u.photo ?? undefined,
      createdAt: u.createdAt.toISOString(),
    }));
  } else {
    const self = await getUserById(user.id);
    if (self) {
      users = [
        {
          ...self,
          photo: self.photo ?? undefined,
          createdAt: self.createdAt.toISOString(),
        },
      ];
    }
  }

  return {
    users,
    isAdmin,
    currentUserId: user.id, // penting agar client tahu siapa dirinya
  };
};
