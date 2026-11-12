import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Concurrent test/dev servers must not replace each other's optimized module graph.
  cacheDir: process.env.EOS_PARKING_VITE_CACHE_DIR ?? 'node_modules/.vite',
  resolve: {
    dedupe: ['react', 'react-dom', '@emotion/react', '@emotion/styled', '@mui/material', '@mui/system', '@mui/utils', '@mui/x-date-pickers'],
  },
  optimizeDeps: {
    // Scan lazy workspaces up front so opening a form does not discover a new React/MUI graph.
    entries: ['index.html', 'src/**/*.{ts,tsx}', '!src/**/*.test.{ts,tsx}', '!src/**/*.test-support.{ts,tsx}'],
    include: ['react', 'react-dom', 'react-dom/client', 'react/jsx-runtime', 'react/jsx-dev-runtime', '@emotion/react', '@emotion/styled', '@mui/material', '@mui/material/SvgIcon', '@mui/x-date-pickers/LocalizationProvider', '@mui/x-date-pickers/AdapterDayjs', '@mui/x-date-pickers/TimePicker'],
  },
  server: {
    proxy: {
      // SignalR 2 advertises /signalr in negotiation, so its push transports
      // must also reach IIS without the /backend prefix used for the first request.
      '/signalr': {
        target: 'http://localhost:8050',
        changeOrigin: true,
        ws: true,
      },
      '/backend': {
        target: 'http://localhost:8050',
        changeOrigin: true,
        ws: true,
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
