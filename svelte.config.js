// @ts-nocheck
import path from "path";
import adapter from "@sveltejs/adapter-node";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";

const config = {
  preprocess: vitePreprocess({
    postcss: true,
  }),
  kit: {
    adapter: adapter(),
    alias: {
      $lib: path.resolve("src/lib"),
      $server: path.resolve("src/lib/server"),
      $stores: path.resolve("src/stores"),
      $types: path.resolve("src/types"),
    },
  },
};

export default config;
