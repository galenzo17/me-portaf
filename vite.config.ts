import { defineConfig } from "vite";
import { qwikVite } from "@builder.io/qwik/optimizer";

// https://vite.dev/config/
export default defineConfig({
  plugins: [qwikVite({ client: { input: "src/main.tsx" } })],
  build: {
    rollupOptions: {
      input: {
        main: "index.html",
        games: "games/index.html",
      },
    },
  },
});
