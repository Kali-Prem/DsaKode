import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production'),
  },
  build: {
    outDir: 'dist',
    emptyOutDir: false,
    lib: {
      entry: resolve(__dirname, 'src/background/index.ts'),
      name: 'DSAThinkingCoachBackground',
      formats: ['es'],
      fileName: () => 'background.js',
    },
    rollupOptions: {
      output: {
        extend: true,
      },
    },
  },
});
