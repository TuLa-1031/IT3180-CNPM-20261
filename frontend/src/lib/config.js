// Single place for backend connection settings.
// Priority: Vite env -> window.BM_CONFIG -> ?api=1 -> same-origin Spring Boot (port 8080).
const runtime = window.BM_CONFIG || {}
const forced = /[?&]api=1\b/.test(location.search)

export const apiConfig = {
  baseUrl: String(import.meta.env.VITE_API_BASE_URL || runtime.apiBase || '/api').replace(/\/$/, ''),
  enabled: Boolean(import.meta.env.VITE_API_BASE_URL || runtime.apiBase || forced || location.port === '8080'),
  timeout: Number(import.meta.env.VITE_API_TIMEOUT || 1500),
  // Backend currently exposes GET only. Flip to true once write endpoints exist.
  writesEnabled: String(import.meta.env.VITE_API_WRITES || 'false') === 'true'
}
