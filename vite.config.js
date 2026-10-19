import { defineConfig } from 'vite';

// base './' membuat path aset relatif sehingga build aman di Vercel maupun hosting statis lain.
export default defineConfig({
  base: './',
  build: { chunkSizeWarningLimit: 1600 },
});
