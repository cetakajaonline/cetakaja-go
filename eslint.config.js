// eslint.config.js
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import svelte from "eslint-plugin-svelte";

export default [
  ...tseslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  {
    files: ["**/*.ts", "**/*.js"],
    rules: {
      "no-console": "warn",
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
    },
  },
  {
    files: ["**/*.svelte"],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: ["./tsconfig.json"],
        extraFileExtensions: [".svelte"],
      },
    },
    plugins: {
      svelte: svelte,
    },
    processor: svelte.processors.svelte,
  },
];
