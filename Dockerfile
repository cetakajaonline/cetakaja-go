# --------------------------
# Builder Stage
# --------------------------
FROM node:20-alpine AS builder
WORKDIR /app

# Copy package.json dan install dependencies
COPY package.json ./
RUN npm install -g pnpm && pnpm install

# Copy source code
COPY . .

# Generate Prisma client sebelum build
RUN pnpm prisma generate

# Build aplikasi
RUN pnpm run build

# --------------------------
# Production Stage
# --------------------------
FROM node:20-alpine AS production
WORKDIR /app

# Copy package.json dan install production deps
COPY package.json ./
RUN npm install -g pnpm && pnpm install --prod

# Copy hasil build & Prisma client
COPY --from=builder /app/build ./build
COPY --from=builder /app/prisma ./prisma

# Expose port
EXPOSE 3000

# Healthcheck opsional
RUN echo 'const http = require("http"); const options = { host: "localhost", port: 3000, path: "/", timeout: 2000 }; const request = http.request(options, (res) => { process.exitCode = (res.statusCode === 200) ? 0 : 1; process.exit(); }); request.on("error", () => process.exit(1)); request.end();' > healthcheck.js
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 CMD node healthcheck.js || exit 1

# Start app
CMD ["node", "build/index.js"]
