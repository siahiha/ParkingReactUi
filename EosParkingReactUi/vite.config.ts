import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/backend': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/backend/, ''),
      },
      // The local Hsh service on port 5080 does not currently emit CORS
      // headers. Keep the camera setting pointed at the real service URL,
      // while allowing the browser-only development UI to use a same-origin
      // SignalR/artifact proxy.
      '/hsh-detection-service': {
        target: 'http://127.0.0.1:5080',
        changeOrigin: true,
        ws: true,
        rewrite: (path) => path.replace(/^\/hsh-detection-service/, ''),
      },
    },
  },
});
