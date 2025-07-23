import prisma from "$lib/server/prisma";

/**
 * Get all API tokens with user info
 */
export async function getAllKeys() {
  return prisma.apiToken.findMany({
    select: {
      id: true,
      name: true,
      token: true,
      createdBy: true,
      createdAt: true,
      revoked: true,
      creator: {
        select: {
          id: true,
          name: true,
          email: true,
          photo: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

/**
 * Get API token by ID
 */
export async function getKeyById(id: number) {
  return prisma.apiToken.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      token: true,
      createdBy: true,
      createdAt: true,
      revoked: true,
      creator: {
        select: {
          id: true,
          name: true,
          email: true,
          photo: true,
        },
      },
    },
  });
}

/**
 * Get all API tokens created by a user
 */
export async function getKeysByUserId(userId: number) {
  return prisma.apiToken.findMany({
    where: { createdBy: userId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      token: true,
      createdAt: true,
      revoked: true,
      creator: {
        select: {
          id: true,
          name: true,
          email: true,
          photo: true,
        },
      },
    },
  });
}

/**
 * Create a new API token
 */
export async function createKey({
  name,
  token,
  createdBy,
}: {
  name: string;
  token: string;
  createdBy: number;
}) {
  return prisma.apiToken.create({
    data: {
      name,
      token,
      createdBy,
    },
    select: {
      id: true,
      name: true,
      token: true,
      createdAt: true,
      revoked: true,
      creator: {
        select: {
          id: true,
          name: true,
          email: true,
          photo: true,
        },
      },
    },
  });
}

/**
 * Update API token
 */
export async function updateKey(
  id: number,
  {
    name,
    revoked,
  }: {
    name?: string;
    revoked?: boolean;
  }
) {
  const data: Partial<{ name: string; revoked: boolean }> = {};
  if (name !== undefined) data.name = name;
  if (revoked !== undefined) data.revoked = revoked;

  return prisma.apiToken.update({
    where: { id },
    data,
    select: {
      id: true,
      name: true,
      token: true,
      createdAt: true,
      revoked: true,
    },
  });
}

/**
 * Delete API token
 */
export async function deleteKey(id: number) {
  return prisma.apiToken.delete({
    where: { id },
  });
}
