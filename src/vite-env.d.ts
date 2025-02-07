import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    proxy: {
      '/users': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path,
      },
    },
    hmr: {
      overlay: false, // ✅ Vite의 HMR 오류 메시지 비활성화
    },
  },
});
