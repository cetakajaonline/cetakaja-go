import type { PageLoad } from "./$types";
export const load: PageLoad = async ({ fetch }) => {
  const res = await fetch("/api/users");
  const users = await res.json();
  return { users };
};
