import { execSync } from 'child_process';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import injectPreload from 'vite-plugin-inject-preload';
import generateFile from 'vite-plugin-generate-file';
import compression from 'vite-plugin-compression';
import pkg from './package.json';

export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    injectPreload({
      files: [
        { match: /\/app-\w+\.js$/, attributes: { rel: 'modulepreload' } },
        { match: /\/app-\w+\.css$/ },
      ],
    }),
    generateFile([
      {
        type: 'template',
        output: 'version.txt',
        template: 'src/version.ejs',
        data: {
          name: pkg.name,
          version: pkg.version,
          date: new Date().toISOString(),
          commitHash: execSync('git rev-parse --short HEAD').toString().trim(),
        },
      },
    ]),
    compression({
      verbose: false,
      algorithm: 'brotliCompress',
      ext: '.gz',
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
