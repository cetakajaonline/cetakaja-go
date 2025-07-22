// src/routes/+layout.server.ts
export const load = async ({ url, locals }) => {
  let title = "Billing App";

  if (url.pathname === "/dashboard") {
    title = "Dashboard | Billing App";
  } else if (url.pathname === "/login") {
    title = "Login | Billing App";
  } else if (url.pathname === "/users") {
    title = "Users | Billing App";
  } else if (url.pathname === "/") {
    title = "Home | Billing App";
  } else if (url.pathname === "/settings") {
    title = "Settings | Billing App";
  }

  return { title, user: locals.user ?? null };
};
