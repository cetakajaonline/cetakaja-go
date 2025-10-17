FROM node:20-alpine AS builder

# Install pnpm
RUN npm install -g pnpm

WORKDIR /app

# Copy package.json first
COPY package.json ./

# Install dependencies
RUN pnpm install

# Copy the rest of the source code
COPY . .

# Build the application
RUN pnpm build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files and built application from builder stage
COPY --from=builder /app/package.json ./
COPY --from=builder /app/build ./build
COPY --from=builder /app/prisma ./prisma

# Check if pnpm-lock.yaml exists and copy if available, otherwise proceed
RUN if [ -f /app/pnpm-lock.yaml ]; then cp /app/pnpm-lock.yaml .; fi

# Install only production dependencies
RUN pnpm install --prod --no-optional

# Expose the port the app runs on
EXPOSE 3000

# Start the application
CMD ["node", "build/index.js"]