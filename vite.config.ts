import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/acf-pacf-interactive-guide/',
  build: {
    outDir: 'dist',
  },
});
