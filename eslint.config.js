// eslint.config.js
import js from "@eslint/js";
import ts from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import svelte from "eslint-plugin-svelte";

export default [
  // Basic JavaScript config
  js.configs.recommended,

  // TypeScript config (non type-aware to avoid tsconfig issues)
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: "module",
      },
    },
    plugins: {
      "@typescript-eslint": ts,
    },
    rules: {
      ...ts.configs.recommended.rules,
    },
  },

  // Svelte config
  {
    files: ["**/*.svelte"],
    plugins: {
      svelte,
    },
    processor: svelte.processors.svelte,
  },

  // Ignore files and folders
  {
    ignores: [
      "node_modules",
      "dist",
      "build",
      ".svelte-kit",
      ".vercel",
      "pnpm-lock.yaml",
      "prisma/seed.cjs",
    ],
  },
];
