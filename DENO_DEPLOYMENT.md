# Deployment Guide

## ⚠️ Important: Prisma and Node.js Compatibility

**This application uses Prisma as its database client, which is specifically designed for Node.js environments.** This has important implications:

- Prisma Client is generated with Node.js-specific code
- Prisma requires Node.js runtime APIs that may not be available in all environments
- The Prisma ecosystem is built for the Node.js ecosystem

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

The `tsconfig.json` has been updated to work without requiring the generated SvelteKit config file during initial validation.

## Issues with Deno Deployment

While this application can be built on Deno-compatible environments with Node.js compatibility features, deploying it to Deno may encounter issues due to Prisma incompatibility. If you experience build errors like:

```
SyntaxError: The requested module '@prisma/client' does not provide an export named 'PrismaClient'
```

This confirms that the Deno environment does not fully support Prisma. Consider switching to a Node.js-compatible deployment platform.