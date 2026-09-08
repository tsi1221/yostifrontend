import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    proxy: {
      "/api": {
        target: "https://yosti.nedhigibe.com",
        changeOrigin: true,
      },
    },
  },
  optimizeDeps: {
    include: ["recharts", "react", "react-dom", "react-router-dom"]
  }
});
