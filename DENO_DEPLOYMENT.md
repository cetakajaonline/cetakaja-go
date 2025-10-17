# Deno Deployment Guide

## SvelteKit Adapter

The application now uses `@sveltejs/adapter-deno` for Deno deployment compatibility.

## Prisma and Deno Compatibility

**This application uses Prisma as its database client.** For Deno deployment, the imports have been updated to use the `npm:` specifier:

- `import { PrismaClient } from "@prisma/client";` → `import { PrismaClient } from "npm:@prisma/client";`
- Type imports also updated: `import type { Setting } from "npm:@prisma/client";`

## Node.js Built-in Modules

The application has been updated to use the `node:` prefix for built-in module imports, improving compatibility:

- `import path from "path"` → `import path from "node:path"`
- `import fs from "fs"` → `import fs from "node:fs"`
- `import crypto from "crypto"` → `import crypto from "node:crypto"`

## Deployment

To deploy to Deno:

1. Ensure your Deno deployment environment supports Node.js compatibility mode
2. The application should build and run with the `@sveltejs/adapter-deno`