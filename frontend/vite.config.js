import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    //get rid of the CORS error
    proxy: {
      "/api": {
        target: "http://localhost:7500",
        changeOrigin: true,
        secure: false,
      }
    }
  }
})
