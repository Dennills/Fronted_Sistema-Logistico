import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// En desarrollo, el proxy redirige /api/* al backend desplegado en Render,
// evitando problemas de CORS sin tocar la configuración del servidor.
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://api-rest-sistema-logistico.onrender.com',
        changeOrigin: true,
        secure: true,
      },
    },
  },
})
