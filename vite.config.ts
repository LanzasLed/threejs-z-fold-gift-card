import { defineConfig } from 'vite';
import { resolve } from 'path';
import { viteSingleFile } from 'vite-plugin-singlefile';
import { viteStaticCopy } from 'vite-plugin-static-copy';

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
        manualChunks: isSingleFile ? undefined : undefined, // Disable code splitting
        assetFileNames: (assetInfo) => {
          // Keep SVG files in assets/svg/ folder without hash
          if (assetInfo.name?.endsWith('.svg')) {
            return 'assets/svg/[name][extname]';
          }
          return 'assets/[name]-[hash][extname]';
        }
      }
    },
    // Don't inline SVGs so they can be changed after build
    assetsInlineLimit: (filePath) => {
      if (filePath.endsWith('.svg')) return 0; // Never inline SVGs
      return isSingleFile ? 4096 : 0;
    },
    cssCodeSplit: false, // Single CSS bundle
  },
  plugins: [
    ...(isSingleFile ? [viteSingleFile()] : []),
    // Copy SVG files to dist/assets/svg/ (not inlined, so they can be edited)
    ...(!isSingleFile ? [
      viteStaticCopy({
        targets: [
          {
            src: resolve(__dirname, 'src/svg/*.svg'),
            dest: 'assets/svg'
          }
        ]
      })
    ] : [])
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
