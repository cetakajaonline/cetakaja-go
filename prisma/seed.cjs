const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash("admin123", 10);

  await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      name: "Admin",
      email: "admin@example.com",
      password: hashedPassword,
    },
  });

  await prisma.setting.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      name: "WMX",
      description: "Aplikasi Billing Rental PS",
      logo: "/uploads/placeholder.png",
    },
  });

  console.log("✅ Seed selesai");
}

main()
  .catch((e) => {
    console.error("❌ Gagal:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
