// src/lib/server/prisma.ts

import { PrismaClient } from "@prisma/client";

// Define the global type for Prisma client
declare global {
  var prisma: PrismaClient | undefined;
}

// Initialize Prisma Client with Deno compatibility
let prisma: PrismaClient;

// For environments with Node.js compatibility (including Deno's Node.js compatibility mode)
// Check if we're in a Node.js-like environment
if (typeof process !== "undefined" && process?.env) {
  if (process.env.NODE_ENV === "production") {
    prisma = new PrismaClient();
  } else {
    // In development, use the global object to prevent hot reloading issues
    if (!global.prisma) {
      global.prisma = new PrismaClient();
    }
    prisma = global.prisma;
  }
} else {
  // Fallback for other environments, though Prisma requires Node.js
  throw new Error(
    "PrismaClient is not available in this environment. Ensure you're running in a Node.js-compatible environment."
  );
}

export default prisma;
