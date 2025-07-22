import type { PageLoad } from "./$types";
export const load: PageLoad = async ({ fetch }) => {
  const res = await fetch("/api/token");
  const keys = await res.json();
  return { keys };
};
