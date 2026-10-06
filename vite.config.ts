import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    strictPort: true,
    proxy: {
      '/api/policyplanner': {
        target: 'https://policyplanner.com',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api\/policyplanner/, ''),
        configure: (proxy) => {
          // This is a server-to-server request to the public insurer API.
          proxy.on('proxyReq', (request) => request.removeHeader('origin'));
        },
      },
      '/api/crm': {
        target: 'https://rewardplanners.com',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
