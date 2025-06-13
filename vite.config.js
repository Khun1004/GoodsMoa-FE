import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// npm install -g localtunnel  # 또는 yarn global add localtunnel
// lt --port 5177  # Vite 서버 포트 지정

// https://vite.dev/config/
// http://localhost:5177/
// http://192.168.1.102:5177/
// http://127.0.0.1:5177/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    // host: 'localhost',
    // host: '127.0.0.1',
    port: 5177,
    strictPort: true,
    proxy: {
      '/chatroom': 'http://localhost:8080',
      '/users': 'http://localhost:8080',
      '/ws': {
        target: 'http://localhost:8080',
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
});
// export default defineConfig({
//   plugins: [react()],
//   server: {
//     host: '0.0.0.0',  // Allow connections from any IP
//     port: 5177,
//     strictPort: true,
//     proxy: {
//       '/api': {
//         target: 'http://localhost:8080',
//         changeOrigin: true,
//         secure: false,
//         rewrite: (path) => path.replace(/^\/api/, '')
//       }
//     }
//   },
//   optimizeDeps: {
//     include: ['@ckeditor/ckeditor5-build-classic']
//   }
// });
