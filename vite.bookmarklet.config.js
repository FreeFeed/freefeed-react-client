import { defineConfig } from 'vite';

export default defineConfig({
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
