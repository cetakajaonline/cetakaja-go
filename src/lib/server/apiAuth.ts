// src/lib/server/apiAuth.ts
import prisma from "$lib/server/prisma";

export async function validateApiToken(token: string | undefined) {
  if (!token) return null;

  const found = await prisma.apiToken.findUnique({
    where: { token },
  });

  if (!found || found.revoked) return null;

  return found;
}
