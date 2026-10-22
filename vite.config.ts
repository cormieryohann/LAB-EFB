import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  // Nom du dépôt GitHub : l'application est servie sous https://cormieryohann.github.io/LAB-EFB/
  base: '/LAB-EFB/',
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
  },
});
