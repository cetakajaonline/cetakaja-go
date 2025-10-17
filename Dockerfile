# ==========================
#  STAGE 1 — BUILD
# ==========================
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files (pnpm-lock.yaml* = opsional)
COPY package.json pnpm-lock.yaml* ./

# Install pnpm dan dependencies
RUN npm install -g pnpm \
  && pnpm install --frozen-lockfile

# Copy seluruh source code
COPY . .

# Generate Prisma client & build aplikasi
RUN pnpm prisma generate \
  && pnpm run build

# ==========================
#  STAGE 2 — PRODUCTION
# ==========================
FROM node:20-alpine AS production

# Set working directory
WORKDIR /app

# Copy package files (tanpa source code besar)
COPY package.json pnpm-lock.yaml* ./

# Install pnpm & dependencies produksi saja
RUN npm install -g pnpm \
  && pnpm install --prod --frozen-lockfile

# Copy hasil build dan Prisma client dari builder
COPY --from=builder /app/build ./build
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# (Opsional) copy file statis SvelteKit (jika ada)
COPY --from=builder /app/static ./static

# Expose port
EXPOSE 3000

# Health check (auto-fail jika port tidak merespon)
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node healthcheck.js || exit 1

# Buat script healthcheck sederhana
RUN echo 'const http=require("http");const req=http.request({host:"localhost",port:3000,path:"/",timeout:2000},res=>process.exit(res.statusCode===200?0:1));req.on("error",()=>process.exit(1));req.end();' > healthcheck.js

# Start aplikasi
CMD ["node", "build/index.js"]
