import prisma from "$lib/server/prisma";

export function getSetting() {
  return prisma.setting.findUnique({ where: { id: 1 } });
}

export function updateSetting(data: {
  name?: string;
  description?: string;
  logo?: string;
}) {
  return prisma.setting.update({
    where: { id: 1 },
    data,
  });
}

