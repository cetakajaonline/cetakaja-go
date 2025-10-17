// src/lib/server/prisma.ts

let prisma: any

if (typeof window === 'undefined') {
  // Gunakan dynamic import agar aman di Deno
  const mod = await import('npm:@prisma/client')

  // Beberapa versi Prisma di Deno menempatkan class di mod.default
  const PrismaClient = mod.PrismaClient || mod.default?.PrismaClient

  if (!PrismaClient) {
    throw new Error('Gagal memuat PrismaClient dari @prisma/client')
  }

  // Gunakan globalThis agar tidak membuat banyak instance saat HMR
  if (!globalThis.__prisma) {
    globalThis.__prisma = new PrismaClient()
  }

  prisma = globalThis.__prisma
} else {
  throw new Error('PrismaClient tidak bisa dijalankan di browser')
}

export default prisma
