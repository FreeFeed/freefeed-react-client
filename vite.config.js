import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import defaultConfig from './config/default';

export default defineConfig(({ mode }) => {
  return {
    plugins: [react()],
    build: { outDir: '_dist' },
    define: {
      'process.env.TZ': JSON.stringify('UTC'),
      'process.env.NODE_ENV': JSON.stringify(
        process.env.NODE_ENV === 'production' ? 'production' : 'development',
      ),
      ...(mode === 'test'
        ? { CONFIG: JSON.stringify(defaultConfig) }
        : { 'process.platform': JSON.stringify('web') }),
    },
    test: {
      include: ['**/*.js'],
    },
  };
});
