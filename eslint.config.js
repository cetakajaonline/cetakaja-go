import js from "@eslint/js";
import ts from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import svelte from "eslint-plugin-svelte";

export default [
  js.configs.recommended,

  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: ["./tsconfig.json"],
      },
    },
    plugins: {
      "@typescript-eslint": ts,
    },
    rules: {
      ...ts.configs["recommended"].rules,
      ...ts.configs["recommended-type-checked"].rules,
    },
  },

  {
    files: ["**/*.svelte"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: ["./tsconfig.json"],
        extraFileExtensions: [".svelte"],
      },
    },
    plugins: {
      svelte,
    },
    processor: svelte.processors.svelte,
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
