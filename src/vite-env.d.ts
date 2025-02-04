// vite.config.js
import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    proxy: {
      '/users': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        // 필요에 따라 rewrite 옵션 사용 (만약 경로를 그대로 유지하려면 아래와 같이)
        rewrite: (path) => path,
      },
    },
  },
});
