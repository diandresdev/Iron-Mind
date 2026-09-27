import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig(() => {
  return {
    resolve: {
      alias: {
        // Arquitectura ESM moderna: reemplaza a __dirname
        '@': path.resolve(import.meta.dirname, '.'),
      }
    },
    server: {
      hmr: process.env.DISABLE_HMR === 'true' ? false : true,
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    }
  };
});