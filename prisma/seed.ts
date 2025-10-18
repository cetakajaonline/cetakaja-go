// prisma/seed.ts
import { PrismaClient } from "npm:@prisma/client";
import bcrypt from "npm:bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log(
    "🌱 Seeding database with minimal setup (settings and admin user only)...",
  );

  // Clear only settings and user data
  await prisma.user.deleteMany();
  await prisma.setting.deleteMany();

  // Setting
  await prisma.setting.create({
    data: {
      name: "Cetak Aja Online",
      description:
        "Aplikasi Point of Sale untuk Percetakan Dan Digital Printing",
      logo: "/uploads/logo.png",
      bankName: "Seabank",
      bankCode: "535",
      bankAccountNumber: "1234567890",
      bankAccountName: "Yuliana",
      qrisImage: "/uploads/qris/QRIS.jpeg",
    },
  });

  // Hash admin password
  const adminPassword = await bcrypt.hash("admin123", 10);

  // Create Admin user only
  await prisma.user.create({
    data: {
      name: "Administrator",
      username: "admin",
      phone: "081234567890",
      password: adminPassword,
      role: "admin",
      address: "Jakarta, Indonesia",
    },
  });

  console.log("✅ Created 1 admin user and default settings");
  console.log("✅ Seeding completed with minimal setup!");
}

main()
  .catch((e) => {
    console.error("❌ Error:", e);
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect().then(() => {});
  });
