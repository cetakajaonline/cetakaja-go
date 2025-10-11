import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = (event) => {
  // Check if user is authenticated
  if (!event.locals.user) {
    throw redirect(302, "/login");
  }

  const userRole = event.locals.user.role;

  // Only admin and staff can access expenses
  if (userRole !== "admin" && userRole !== "staff") {
    // Only admins can access expenses page
    throw redirect(302, "/dashboard");
  }

  return {
    isAdmin: userRole === "admin",
    isStaff: userRole === "staff",
  };
};
