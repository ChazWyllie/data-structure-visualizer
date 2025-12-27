/// <reference types="vitest" />
import { defineConfig } from 'vite';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.test.ts'],
    exclude: ['node_modules', 'dist'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.ts'],
      exclude: [
        'src/**/*.test.ts',
        'src/main.ts',
        'src/**/index.ts',
        'node_modules',
      ],
      thresholds: {
        // MVP thresholds - focused on step generators
        // UI and rendering components need browser testing
        statements: 15,
        branches: 15,
        functions: 15,
        lines: 15,
      },
    },
  },
});
