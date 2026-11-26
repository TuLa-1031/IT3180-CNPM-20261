// Single place for backend connection settings.
// Dev: Vite proxies /api -> http://localhost:8080 (xem vite.config.js).
// Có thể ghi đè bằng VITE_API_BASE_URL khi giao diện chạy tách backend.
const runtime = window.BM_CONFIG || {}

export const apiConfig = {
  baseUrl: String(import.meta.env.VITE_API_BASE_URL || runtime.apiBase || '/api').replace(/\/$/, ''),
  enabled: true,
  timeout: Number(import.meta.env.VITE_API_TIMEOUT || 10000),
  writesEnabled: true
}
