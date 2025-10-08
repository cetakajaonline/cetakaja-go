// eslint.config.js
import js from "@eslint/js";
import ts from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import svelte from "eslint-plugin-svelte";
import svelteParser from "svelte-eslint-parser";
import globals from "globals";

/** @type {import("eslint").Linter.FlatConfig[]} */
export default [
  {
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2021,
        App: "readonly", // ✅ supaya ESLint tahu App itu global yang tidak bisa diubah
      },
    },
  },

  js.configs.recommended,

  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: ["./tsconfig.eslint.json"],
        tsconfigRootDir: process.cwd(),
        ecmaVersion: "latest",
        sourceType: "module",
      },
    },
    plugins: {
      "@typescript-eslint": ts,
    },
    rules: {
      ...ts.configs.recommended.rules,
      ...ts.configs["recommended-type-checked"].rules,

      // Nonaktifkan rule yang terlalu strict (opsional)

      "@typescript-eslint/no-unsafe-call": "off",
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",
      "@typescript-eslint/no-unsafe-argument": "off",
      "@typescript-eslint/only-throw-error": "off",
    },
  },

  {
    files: ["**/*.svelte"],
    languageOptions: {
      parser: svelteParser,
      parserOptions: {
        parser: tsParser,
        ecmaVersion: "latest",
        sourceType: "module",
        project: ["./tsconfig.eslint.json"],
        tsconfigRootDir: process.cwd(),
        extraFileExtensions: [".svelte"],
      },
    },
    plugins: {
      svelte,
    },
    processor: svelte.processors.svelte,
    rules: {
      "no-unused-vars": "off",
    },
  },

  {
    ignores: [
      "node_modules",
      "dist",
      "build",
      ".svelte-kit",
      ".vercel",
      "pnpm-lock.yaml",
    ],
  },
];
