import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  base: '/employee-login/',
  plugins: [react(), tailwindcss()],
  server: {
    open: true,
    watch: { ignored: ['**/.*-validation/**'] },
    port: 5173,
    strictPort: false,
    proxy: {
      '/v1': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
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
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
