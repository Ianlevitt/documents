import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    rollupOptions: {
      input: 'public/index.html'
    }
  },
  server: {
    port: 3000
  }
}) 