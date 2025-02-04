import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    proxy: {
      '/users': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path,
      }
    }
  }
});
