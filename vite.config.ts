import { defineConfig } from 'vite';
import { resolve } from 'path';
import { viteSingleFile } from 'vite-plugin-singlefile';

const isSingleFile = process.env.SINGLE_FILE === 'true';

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
        inlineDynamicImports: isSingleFile, // Single JS bundle for single-file mode
        manualChunks: isSingleFile ? undefined : undefined // Disable code splitting
      }
    },
    // Optimize asset handling
    assetsInlineLimit: isSingleFile ? 4096 : 0, // Inline assets < 4KB in single-file mode
    cssCodeSplit: false, // Single CSS bundle
  },
  plugins: isSingleFile ? [
    viteSingleFile() // Inline CSS/JS into single HTML file only in single-file mode
  ] : [],
  server: {
    port: 5173,
    open: true,
  },
  // Optimize dependencies
  optimizeDeps: {
    include: ['three']
  }
});
