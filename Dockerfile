FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install pnpm and dependencies
RUN npm install -g pnpm
RUN pnpm install

# Copy source code
COPY . .

# Build the application
RUN pnpm run build

# Generate Prisma client
RUN pnpm prisma generate

# Production stage
FROM node:20-alpine AS production

# Set working directory
WORKDIR /app

# Install production dependencies only
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm
RUN pnpm install --prod

# Copy built application from builder stage
COPY --from=builder /app/build ./build
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/src ./src
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node healthcheck.js || exit 1

# Create a simple healthcheck script
RUN echo 'const http = require(\"http\"); const options = { host: \"localhost\", port: 3000, path: \"/\", timeout: 2000 }; const request = http.request(options, (res) => { process.exitCode = (res.statusCode === 200) ? 0 : 1; process.exit(); }); request.on(\"error\", () => process.exit(1)); request.end();' > healthcheck.js

# Start the application
CMD ["node", "build/index.js"]