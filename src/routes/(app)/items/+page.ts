import type { PageLoad } from "./$types";
export const load: PageLoad = async ({ fetch }) => {
  const res = await fetch("/api/items");
  const items = await res.json();
  return { items };
};
