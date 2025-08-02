// prisma/seed.ts
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { fileURLToPath } from 'url'

const prisma = new PrismaClient()

export default async function seed() {
  const hashedPassword = await bcrypt.hash('admin123', 10)

  await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      name: 'Admin',
      email: 'admin@example.com',
      password: hashedPassword,
      role: 'admin',
    },
  })

  await prisma.setting.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      name: 'BITS Project',
      description: 'Aplikasi Startup untuk mengelola proyek dan tim.',
      logo: '/uploads/placeholder.png',
    },
  })
}

// Cek apakah file ini dijalankan langsung (bukan di-import)
const isMain = process.argv[1] === fileURLToPath(import.meta.url)

if (isMain) {
  seed()
    .then(() => {
      console.log('✅ Seed selesai')
      return prisma.$disconnect()
    })
    .catch(async (e) => {
      console.error('❌ Gagal seed:', e)
      await prisma.$disconnect()
      process.exit(1)
    })
}
