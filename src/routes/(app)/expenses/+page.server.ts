import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { getAllExpenses } from "$lib/server/expenseService";

export const load: PageServerLoad = async (event) => {
  // Check if user is authenticated
  if (!event.locals.user) {
    throw redirect(302, "/login");
  }

  const userRole = event.locals.user.role;

  // Only admin and staff can access expenses
  if (userRole !== "admin" && userRole !== "staff") {
    throw redirect(302, "/unauthorized");
  }

  const expenses = await getAllExpenses();

  return {
    expenses,
    isAdmin: userRole === "admin",
    isStaff: userRole === "staff",
  };
};
