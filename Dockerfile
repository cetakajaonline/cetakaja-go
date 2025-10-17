# --------------------------
# Builder Stage
# --------------------------
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package.json saja (tidak perlu lock file)
COPY package.json ./

# Install pnpm dan dependencies
RUN npm install -g pnpm && pnpm install

# Copy seluruh source code
COPY . .

# Generate Prisma client dulu sebelum build
RUN pnpm prisma generate

# Build aplikasi SvelteKit
RUN pnpm run build

# --------------------------
# Production Stage
# --------------------------
FROM node:20-alpine AS production

WORKDIR /app

# Copy package.json untuk install dep production
COPY package.json ./

# Install pnpm & dependencies production
RUN npm install -g pnpm && pnpm install --prod

# Copy hasil build + prisma client dari builder
COPY --from=builder /app/build ./build
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Expose port
EXPOSE 3000

# Optional: simple healthcheck
RUN echo 'const http = require("http"); const options = { host: "localhost", port: 3000, path: "/", timeout: 2000 }; const request = http.request(options, (res) => { process.exitCode = (res.statusCode === 200) ? 0 : 1; process.exit(); }); request.on("error", () => process.exit(1)); request.end();' > healthcheck.js
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 CMD node healthcheck.js || exit 1

# Start aplikasi
CMD ["node", "build/index.js"]
