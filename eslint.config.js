// eslint.config.js
import js from "@eslint/js";
import ts from "typescript-eslint";
import svelte from "eslint-plugin-svelte";

export default [
  js.configs.recommended,
  ...ts.configs.recommended,
  ...ts.configs.recommendedTypeChecked,
  {
    files: ["**/*.ts", "**/*.js"],
    languageOptions: {
      parser: ts.parser,
      parserOptions: {
        project: ["./tsconfig.json"], // ✅ enable type-aware rules
        tsconfigRootDir: process.cwd(),
      },
    },
    rules: {
      "no-console": "warn",
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
    },
  },
  {
    files: ["**/*.svelte"],
    languageOptions: {
      parser: ts.parser,
      parserOptions: {
        project: ["./tsconfig.json"],
        tsconfigRootDir: process.cwd(),
        extraFileExtensions: [".svelte"],
      },
    },
    plugins: {
      svelte,
    },
    processor: svelte.processors.svelte,
  },
];
