import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: { alias: { '@shared': fileURLToPath(new URL('../shared', import.meta.url)) } },
  server: {
    port: 5174,
    fs: { allow: ['..'] },
    proxy: { '/api': { target: 'http://localhost:5000', changeOrigin: true } },
  },
  preview: { port: 4174 },
});
