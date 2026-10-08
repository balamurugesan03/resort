import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: { alias: { '@shared': fileURLToPath(new URL('../shared', import.meta.url)) } },
  server: {
    port: 5173,
    fs: { allow: ['..'] },
    proxy: { '/api': { target: 'http://localhost:5000', changeOrigin: true } },
  },
  build: {
    chunkSizeWarningLimit: 1600,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (/node_modules[\\/](three|@react-three)/.test(id)) return 'three';
        },
      },
    },
  },
});
