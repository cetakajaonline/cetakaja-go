// utils/fetcher.ts
import type { z } from "zod";

export async function fetcher<T>(
  url: string,
  options: RequestInit = {},
  validator?: z.ZodSchema<T>,
): Promise<T> {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  const json = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(json.message || "Terjadi kesalahan saat memuat data");
  }

  if (validator) {
    const parsed = validator.safeParse(json);
    if (!parsed.success) {
      throw new Error("Data response tidak valid");
    }
    return parsed.data;
  }

  // fallback, dianggap unsafe jika tanpa validator
  return json as T;
}

