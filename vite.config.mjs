import { execSync } from 'child_process';
import legacy from '@vitejs/plugin-legacy';
import react from '@vitejs/plugin-react-swc';
import { defineConfig } from 'vite';
import generateFile from 'vite-plugin-generate-file';
import pkg from './package.json';
import { injectInlineResources } from './src/vite/inject-inline-resources';
import { injectPreload } from './src/vite/inject-preload';

// Move the listed node modules into separate named chunks. Format: module name
// - chunk name.
const vendorChunks = [
  // react
  ['react', 'react'],
  ['react-dom', 'react'],
  // react-router
  ['react-router', 'react-router'],
  ['react-router-redux', 'react-router'],
  // libs
  ['lodash-es', 'libs'],
  ['date-fns', 'libs'],
  ['socket.io-client', 'libs'],
  // analytics
  ['autotrack', 'analytics'],
  ['@sentry/react', 'analytics'],
];

export default defineConfig(({ mode }) => ({
  plugins: [
    !process.env.MODERN && legacy(),
    react(),
    injectPreload({
      files: [
        {
          match: /\/app-\w+\.js$/,
          attributes: { rel: 'modulepreload', type: 'application/javascript', as: 'script' },
        },
        {
          match: /\/vendor-.+?\.js$/,
          attributes: { rel: 'modulepreload', type: 'application/javascript', as: 'script' },
        },
        { match: /\/app-\w+\.css$/, attributes: { type: 'text/css', as: 'style' } },
      ],
    }),
    injectInlineResources(),
    mode === 'production' &&
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
  ],
  build: {
    outDir: '_dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          for (const [module, chunk] of vendorChunks) {
            if (id.includes(`/node_modules/${module}/`)) {
              return `vendor-${chunk}`;
            }
          }
        },
      },
    },
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
