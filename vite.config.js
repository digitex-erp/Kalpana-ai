import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
// This is now the primary configuration file to resolve Vercel build issues.
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Set up a path alias for cleaner imports, pointing to the 'src' directory.
      '@': path.resolve('src'),
    },
  },
  build: {
    // Vite's default output directory 'dist' is automatically recognized by Vercel.
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Creates separate chunks for major dependencies to reduce the main vendor chunk size.
          // This helps avoid deployment timeouts on platforms like Vercel.
          if (id.includes('node_modules')) {
            if (id.includes('react-dom') || id.includes('react')) {
              return 'vendor-react';
            }
            if (id.includes('video.js')) {
              return 'vendor-videojs';
            }
            return 'vendor'; // All other node_modules
          }
        }
      }
    },
    // Increased limit to reduce log noise, as vendor chunks can still be large.
    chunkSizeWarningLimit: 1000,
  },
});