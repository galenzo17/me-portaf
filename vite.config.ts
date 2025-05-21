import { defineConfig } from "vite";
import { qwikVite } from "@builder.io/qwik/optimizer";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    qwikVite({ client: { input: ["src/main.tsx", "src/main-services.tsx"] } })
  ],
  build: {
    rollupOptions: {
      input: ["index.html", "services.html"],
    },
  },
});
