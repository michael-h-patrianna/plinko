import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    // Prefer .web.ts files for web builds (platform adapters)
    // Vite automatically resolves: .web.ts > .ts
    extensions: ['.web.ts', '.web.tsx', '.ts', '.tsx', '.js', '.jsx'],
  },
  server: {
    port: 5173
  },
  preview: {
    port: 4173
  }
})
