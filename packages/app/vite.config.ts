import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: { port: 5173 },
  // `vite preview` is used to serve the production build on Railway ($PORT, any host)
  preview: {
    host: true,
    port: Number(process.env.PORT) || 4173,
    allowedHosts: true,
  },
  optimizeDeps: { include: ["react", "react-dom"] },
});
