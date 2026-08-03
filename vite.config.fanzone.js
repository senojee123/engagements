import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// Standalone Vite build configuration for FanZone Mobile Smartphone Portal
export default defineConfig({
  plugins: [react()],
  root: '.',
  build: {
    outDir: 'dist-fanzone',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        index: path.resolve(__dirname, 'fanzone.html'),
      },
    },
  },
  server: {
    port: 5175,
  },
});
