import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

export default defineConfig({
  plugins: [react()],

  server: {
    port: 5174,       // change if needed
    strictPort: true, // avoids silent port switching
  },

  build: {
    outDir: "dist",
  },
});
