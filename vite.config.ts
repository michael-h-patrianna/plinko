import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    extensions: ['.web.ts', '.web.tsx', '.ts', '.tsx', '.js', '.jsx'],
    alias: {
      '@plinko': fileURLToPath(new URL('./src/plinko', import.meta.url)),
      '@demo': fileURLToPath(new URL('./src/demo', import.meta.url)),
    },
  },
  build: {
    // Set realistic warning limit accounting for large dependencies
    // 167KB gzipped is reasonable for a game with animations
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React framework (changes infrequently)
          'vendor-react': ['react', 'react-dom'],
          // Framer Motion is the largest dependency (~100KB+)
          'vendor-framer': ['framer-motion'],
          // Zod validation library
          'vendor-zod': ['zod'],
        },
      },
    },
  },
  server: {
    port: 5173,
  },
  preview: {
    port: 4173,
  },
});
