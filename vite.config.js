import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Exposes the app to your local Wi-Fi network for other laptops
    port: 5173,
  },
})