/// <reference types="vitest/config" />
import { createReadStream, existsSync, statSync } from 'node:fs';
import { resolve, sep } from 'node:path';
import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';

// Dev only: covers stay in the repo-root public/images/ until cutover (Phase 7),
// when they move to frontend/public/images/ and this plugin is deleted.
const legacyCovers = (): Plugin => {
  const dir = resolve(import.meta.dirname, '../public/images');
  return {
    name: 'legacy-covers',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use('/images', (req, res, next) => {
        const file = resolve(dir, decodeURIComponent((req.url ?? '').split('?')[0]).replace(/^\/+/, ''));
        if (!file.startsWith(dir + sep) || !existsSync(file) || !statSync(file).isFile()) {
          return next();
        }
        res.setHeader('Content-Type', 'image/jpeg');
        createReadStream(file).pipe(res);
      });
    },
  };
};

export default defineConfig({
  plugins: [react(), legacyCovers()],
  server: {
    proxy: {
      '/api': 'http://localhost:8080',
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    css: false,
  },
});
