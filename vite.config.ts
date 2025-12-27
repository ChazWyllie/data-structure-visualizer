import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  base: '/data-structure-visualizer/',
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  build: {
    target: 'es2022',
    sourcemap: true,
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: {
          visualizers: ['./src/visualizers/index.ts'],
        },
      },
    },
  },
  server: {
    open: true,
    port: 3000,
  },
});
