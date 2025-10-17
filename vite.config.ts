import tailwindcss from '@tailwindcss/vite'
import { sveltekit } from '@sveltejs/kit/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [tailwindcss(), sveltekit()],

  // Izinkan akses folder luar (opsional, sesuai setup kamu)
  server: {
    fs: {
      allow: ['..']
    }
  },

  // ✅ Tambahan penting agar Prisma tidak di-bundle oleh Rollup
  ssr: {
    external: [
      '@prisma/client',
      'npm:@prisma/client'
    ]
  },

  build: {
    rollupOptions: {
      external: [
        '@prisma/client',
        'npm:@prisma/client'
      ]
    }
  }
})
