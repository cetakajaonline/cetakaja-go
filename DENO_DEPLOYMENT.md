# Deno Deployment Guide

This guide explains how to deploy your SvelteKit application to Deno.

## Issues and Solutions

### Node.js Built-in Modules
Deno requires Node.js built-in modules to be imported with the `node:` prefix. All imports like:
- `import path from "path"` → `import path from "node:path"`
- `import fs from "fs"` → `import fs from "node:fs"`
- `import crypto from "crypto"` → `import crypto from "node:crypto"`

Have been updated in the codebase.

### Missing .svelte-kit/tsconfig.json
During Deno deployment, the generated `.svelte-kit/tsconfig.json` file may not exist when the build process starts. 

## Deployment Options

### Option 1: Use build:deno script
Run the following command to ensure SvelteKit files are generated before building:
```bash
pnpm build:deno
```

### Option 2: Use alternative tsconfig
Use `tsconfig.deno.json` instead of `tsconfig.json` during deployment, which doesn't depend on the generated SvelteKit config file.