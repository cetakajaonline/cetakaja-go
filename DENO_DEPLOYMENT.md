# Deployment Guide

## Prisma and Deno Compatibility

**This application uses Prisma as its database client.** For Deno deployment, the imports have been updated to use the `npm:` specifier:

- `import { PrismaClient } from "@prisma/client";` → `import { PrismaClient } from "npm:@prisma/client";`
- Type imports also updated: `import type { Setting } from "npm:@prisma/client";`

## Recommended Deployment Platforms

For the best experience, deploy this SvelteKit + Prisma application to Node.js-compatible platforms:

- **Vercel** (recommended for SvelteKit) 
- **Netlify**
- **Railway**
- **AWS/Azure** with Node.js runtime
- Other Node.js hosting providers

## Node.js Built-in Modules

The application has been updated to use the `node:` prefix for built-in module imports, improving compatibility:

- `import path from "path"` → `import path from "node:path"`
- `import fs from "fs"` → `import fs from "node:fs"`
- `import crypto from "crypto"` → `import crypto from "node:crypto"`

## SvelteKit Configuration

The `tsconfig.json` extends the generated SvelteKit configuration, which is required for proper compilation.

## Deno Deployment

With the changes made, the application should now be compatible with Deno deployments that support Node.js compatibility mode.