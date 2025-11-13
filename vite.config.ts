import { defineConfig } from 'vite';
import { resolve } from 'path';
import { viteSingleFile } from 'vite-plugin-singlefile';

export default defineConfig({
  root: 'src',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    minify: 'terser',
    target: 'es2020',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console logs in production
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug']
      },
      mangle: {
        toplevel: true
      }
    },
    rollupOptions: {
      input: resolve(__dirname, 'src/index.html'),
      output: {
        inlineDynamicImports: true, // Single JS bundle
        manualChunks: undefined // Disable code splitting for smaller output
      }
    },
    // Optimize asset handling
    assetsInlineLimit: 4096, // Inline assets < 4KB
    cssCodeSplit: false, // Single CSS bundle
  },
  plugins: [
    viteSingleFile() // Inline CSS/JS into single HTML file
  ],
  server: {
    port: 5173,
    open: true,
  },
  // Optimize dependencies
  optimizeDeps: {
    include: ['three']
  }
});
