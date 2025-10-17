# Builder stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package.json saja (tidak perlu pnpm-lock.yaml)
COPY package.json ./

# Install pnpm & dependencies
RUN npm install -g pnpm \
    && pnpm install

# Copy source code
COPY . .

# Build aplikasi
RUN pnpm run build

# Generate Prisma client
RUN pnpm prisma generate

# Production stage
FROM node:20-alpine AS production

WORKDIR /app

# Copy package.json saja
COPY package.json ./

# Install hanya dependencies production
RUN npm install -g pnpm \
    && pnpm install --prod

# Copy hasil build dari builder stage
COPY --from=builder /app/build ./build
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/src ./src
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

EXPOSE 3000

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node healthcheck.js || exit 1

RUN echo 'const http = require("http"); const options = { host: "localhost", port: 3000, path: "/", timeout: 2000 }; const request = http.request(options, (res) => { process.exitCode = (res.statusCode === 200) ? 0 : 1; process.exit(); }); request.on("error", () => process.exit(1)); request.end();' > healthcheck.js

CMD ["node", "build/index.js"]
