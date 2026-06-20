import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Forcer le build de dev de React (sinon `act()` n'est pas dispo et RTL throw).
  resolve: { conditions: ['development', 'browser'] },
  define: { 'process.env.NODE_ENV': JSON.stringify('test') },
  test: {
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    environment: 'node',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    coverage: {
      reporter: ['text', 'html'],
      include: ['src/app/components/**/*.{ts,tsx}'],
      exclude: ['**/*.test.*', '**/*.spec.*', '**/figma/**', '**/ui/**'],
    },
  },
});
