// src/lib/server/prisma.ts

let prisma: any

// Jalankan hanya di environment server (bukan client/browser)
if (typeof window === 'undefined') {
  // Gunakan dynamic import agar Deno tidak membundel Prisma saat build
  const { PrismaClient } = await import('npm:@prisma/client')

  // Gunakan globalThis untuk mencegah duplikasi PrismaClient saat HMR/dev
  if (!globalThis.__prisma) {
    globalThis.__prisma = new PrismaClient()
  }

  prisma = globalThis.__prisma
} else {
  throw new Error('PrismaClient tidak bisa digunakan di sisi browser.')
}

export default prisma
