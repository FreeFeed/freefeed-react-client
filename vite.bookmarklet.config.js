import { defineConfig } from 'vite';
import compression from 'vite-plugin-compression';

export default defineConfig({
  plugins: [
    compression({
      verbose: false,
      algorithm: 'brotliCompress',
      ext: '.gz',
    }),
  ],
  publicDir: false,
  build: {
    outDir: '_dist/assets/js',
    lib: {
      entry: './src/bookmarklet/popup.js',
      formats: ['iife'],
      name: 'popup',
    },
    rollupOptions: {
      output: {
        entryFileNames: 'bookmarklet-popup.js',
      },
    },
  },
});
