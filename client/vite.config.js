import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: { port: 5173 },
  build: {
    sourcemap: false,
    chunkSizeWarningLimit: 700,
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom', 'react-redux', '@reduxjs/toolkit'],
          charts: ['recharts'],
          documents: ['jspdf', 'jspdf-autotable'],
          motion: ['framer-motion'],
          feedback: ['sweetalert2', 'react-hot-toast'],
        },
      },
    },
  },
});
