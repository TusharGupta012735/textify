import { defineConfig } from 'vite'
import tailwindcss from "@tailwindcss/vite";
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    watch: {
      usePolling: true, // Required for WSL2 file system
      interval: 1000, // Poll every second
    },
    hmr: {
      clientPort: 5173, // Explicit HMR port
    },
  },
});
