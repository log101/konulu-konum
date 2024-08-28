import { defineConfig } from 'astro/config';
import react from "@astrojs/react";
import tailwind from "@astrojs/tailwind";

const devMode = import.meta.env.DEV

// https://astro.build/config
export default defineConfig({
  integrations: [react(), tailwind({
    applyBaseStyles: false
  })],
  output: "static",
  site: devMode ? "http://localhost:4321" : "https://konulukonum.com"
});
