import { execSync } from 'child_process';
import { readFileSync } from 'fs';
import { parse } from 'path';
import { Remarkable } from 'remarkable';
import legacy from '@vitejs/plugin-legacy';
import react from '@vitejs/plugin-react-swc';
import { defineConfig } from 'vite';
import generateFile from 'vite-plugin-generate-file';
import { VitePWA } from 'vite-plugin-pwa';
import { globSync } from 'glob';
import matter from 'gray-matter';
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
    VitePWA({
      registerType: 'prompt',
      devOptions: { enabled: true },
      manifest: {
        name: 'FreeFeed',
        short_name: 'FreeFeed',
        description: 'A small and free social network',
        id: '/?pwa=1',
        start_url: '/',
        icons: [
          {
            src: '/assets/images/pwa-64x64.png',
            sizes: '64x64',
            type: 'image/png',
          },
          {
            src: '/assets/images/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/assets/images/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: '/assets/images/maskable-icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        // Don't use 'index.html' fallback for these routes
        navigateFallbackDenylist: [
          /^\/(v\d+|socket\.io|api)\//,
          /^\/(config\.json|version\.txt|robots\.txt)$/,
          /^\/(docs|assets)\//,
        ],
        // Add '.woff2' and exclude (!) '.html' from the default 'globPatterns'.
        // We don't want to cache index.html because of beta/non-beta switching
        // and the possible config.json inclusion. So we only cache the assets
        // but not the page itself.
        globPatterns: ['**/*.{js,wasm,css,woff2}'],
        runtimeCaching: [
          // Cache profile pictures (up to 100 entries)
          {
            urlPattern: /^https:\/\/(stable-)?media\.freefeed\.net\/profilepics\//,
            handler: 'CacheFirst',
            options: {
              cacheName: 'profile-pictures',
              expiration: {
                maxEntries: 100,
              },
            },
          },
        ],
      },
    }),
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
        // Doc files from markdown sources
        ...globSync('./src/docs/texts/*.md').map((file) => {
          const fileContent = readFileSync(file, 'utf8');
          const fileData = matter(fileContent);
          return {
            type: 'template',
            output: `docs/${parse(file).name}/index.html`,
            template: 'src/docs/template.ejs',
            data: {
              ...fileData.data,
              content: new Remarkable().render(fileData.content),
            },
          };
        }),
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
    poolOptions: { forks: { singleFork: true } },
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
  css: {
    preprocessorOptions: {
      scss: { api: 'modern-compiler' },
    },
  },
}));
