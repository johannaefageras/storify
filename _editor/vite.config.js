import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  server: {
    port: 5174
  },
  publicDir: resolve(import.meta.dirname, '../static')
});
