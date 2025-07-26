// eslint.config.js
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import svelte from "eslint-plugin-svelte";
import prettier from "eslint-plugin-prettier";

export default [
  // 1. Ignore rules
  {
    ignores: ["**/node_modules/**", "**/.svelte-kit/**", "**/build/**"],
  },

  // 2. Base config
  js.configs.recommended,

  // 3. TypeScript-aware config
  ...tseslint.configs.recommendedTypeChecked,
  {
    files: ["**/*.ts", "**/*.svelte"],
    languageOptions: {
      parserOptions: {
        project: ["./tsconfig.json"],
      },
    },
  },

  // 4. Svelte support
  {
    files: ["**/*.svelte"],
    plugins: {
      svelte: svelte,
    },
    languageOptions: {
      parser: svelte.parser,
    },
    processor: svelte.processor,
  },

  // 5. Prettier integration
  {
    plugins: { prettier },
    rules: {
      "prettier/prettier": "error",
    },
  },
];
