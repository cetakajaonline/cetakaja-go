import adapter from "@sveltejs/adapter-auto";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";

const config = {
  preprocess: vitePreprocess({
    postcss: true, // Penting meskipun kamu tidak pakai postcss.config.js
  }),
  kit: {
    adapter: adapter(),
  },
};

export default config;
