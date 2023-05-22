import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import VitePluginInjectPreload from 'vite-plugin-inject-preload';

export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    VitePluginInjectPreload({
      files: [
        { match: /\/app-\w+\.js$/, attributes: { rel: 'modulepreload' } },
        { match: /\/app-\w+\.css$/ },
      ],
    }),
  ],
  build: {
    outDir: '_dist',
    sourcemap: true,
  },
  server: { host: true, port: 3333 },
  preview: { host: true, port: 4444 },
  define:
    mode !== 'test'
      ? {
          'process.platform': JSON.stringify('web'),
          'process.env.NODE_ENV': JSON.stringify(mode),
        }
      : {},
  test: {
    include: ['test/unit/**/*.{js,jsx}', 'test/jest/**/*.test.{js,jsx}'],
    singleThread: true,
    globals: true,
    clearMocks: true,
    environment: 'jsdom',
    setupFiles: './test/vitest-setup.js',
    css: {
      modules: {
        classNameStrategy: 'non-scoped',
      },
    },
  },
}));
