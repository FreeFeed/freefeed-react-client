import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

export default defineConfig({
  plugins: [react()],
  build: { outDir: '_dist' },
  define: {
    'process.platform': JSON.stringify('web'),
    'process.env.TZ': JSON.stringify('UTC'),
    'process.env.NODE_ENV': JSON.stringify(
      process.env.NODE_ENV === 'production' ? 'production' : 'development',
    ),
  },
});
