import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';

// npm install -g localtunnel  # 또는 yarn global add localtunnel
// lt --port 5177  # Vite 서버 포트 지정

// https://vite.dev/config/
// http://localhost:5177/
// http://192.168.1.102:5177/
// http://127.0.0.1:5177/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());
  const apiBaseUrl = env.VITE_API_BASE_URL;

  return {
    plugins: [react()],
    server: {
      host: '0.0.0.0',
      // host: 'localhost',
      // host: '127.0.0.1',
      port: 5177,
      strictPort: true,
      proxy: {
        '/chatroom': apiBaseUrl,
        '/users': apiBaseUrl,
        '/ws': {
          target: apiBaseUrl,
          ws: true,
          changeOrigin: true,
        },
      },
    },
    define: {
      global: 'globalThis',  // ✅ 여기가 정확한 위치입니다
    },

    optimizeDeps: {
      include: ['@ckeditor/ckeditor5-build-classic']
    }  
  };
});
