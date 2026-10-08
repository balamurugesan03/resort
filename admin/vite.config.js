import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath } from 'node:url';

export default defineConfig(({ mode }) => ({
  // Sub-path the app is served from, e.g. /resort/ in production (see .env.production).
  base: loadEnv(mode, process.cwd(), '').VITE_BASE || '/',
  plugins: [react(), tailwindcss()],
  resolve: { alias: { '@shared': fileURLToPath(new URL('../shared', import.meta.url)) } },
  server: {
    port: 5174,
    fs: { allow: ['..'] },
    proxy: { '/api': { target: 'http://localhost:5000', changeOrigin: true } },
  },
  preview: { port: 4174 },
}));
