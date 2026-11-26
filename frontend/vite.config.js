import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// Giao diện chạy riêng ở 5173 vẫn gọi được backend 8080 qua proxy /api.
// Đổi backend bằng VITE_API_PROXY_TARGET trong .env.local khi cần.
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiTarget = env.VITE_API_PROXY_TARGET || 'http://localhost:8080'

  return {
    plugins: [react()],
    server: {
      port: 5173,
      proxy: {
        '/api': {
          target: apiTarget,
          changeOrigin: true
        }
      }
    }
  }
})
