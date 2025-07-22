import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{html,js,svelte,ts}"],
  theme: {
    extend: {},
  },
  plugins: [], // jangan isi dengan daisyui kalau sudah pakai @plugin di CSS
};

export default config;
