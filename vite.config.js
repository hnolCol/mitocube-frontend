import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
export default defineConfig({
  base : "/",
  resolve: {
    dedupe: ["react", "react-dom", "@tanstack/react-query"],
  },
  server: {
    proxy: {
      "/api": {
        target: "http://127.0.0.1:5002",
        changeOrigin: true,
        secure: false,
        ws: true,
        // rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
    port: 3000,
  },
  plugins: [react()],
});