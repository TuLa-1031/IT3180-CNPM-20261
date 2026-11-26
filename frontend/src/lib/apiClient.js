// Transport only: URL building, JSON, JWT header, timeout and error parsing.
// Domain paths and response shapes live in lib/resources.js.
import { apiConfig } from './config'
import { clearToken, getToken } from './auth'

export class ApiError extends Error {
  constructor(message, status = 0, code = null, fieldErrors = []) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.fieldErrors = fieldErrors
  }
}

function isJsonBody(body) {
  return body !== undefined && body !== null
    && typeof body !== 'string'
    && !(body instanceof FormData)
    && !(body instanceof Blob)
}

export function createClient({ baseUrl, timeout = 10000 }) {
  async function request(path, options = {}) {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), timeout)
    const headers = new Headers(options.headers || {})

    if (!headers.has('Accept')) headers.set('Accept', 'application/json')

    const token = getToken()
    if (token && !headers.has('Authorization')) headers.set('Authorization', `Bearer ${token}`)

    let body = options.body
    if (isJsonBody(body)) {
      headers.set('Content-Type', 'application/json')
      body = JSON.stringify(body)
    }

    try {
      const response = await fetch(baseUrl + path, { ...options, headers, body, signal: controller.signal })

      if (!response.ok) {
        let payload = null
        try {
          payload = await response.json()
        } catch {
          /* lỗi không có JSON (proxy, 502…) */
        }
        if (response.status === 401 && !path.startsWith('/auth/login')) {
          clearToken()
          window.dispatchEvent(new Event('bluemoon:unauthorized'))
        }
        throw new ApiError(
          payload?.message || `Máy chủ trả lỗi ${response.status}`,
          response.status,
          payload?.code || null,
          payload?.fieldErrors || []
        )
      }

      if (response.status === 204) return null
      const text = await response.text()
      return text ? JSON.parse(text) : null
    } catch (err) {
      if (err.name === 'AbortError') {
        throw new ApiError('Máy chủ không phản hồi, vui lòng thử lại', 0)
      }
      if (err instanceof ApiError) throw err
      throw new ApiError('Không kết nối được máy chủ', 0)
    } finally {
      clearTimeout(timer)
    }
  }

  async function getList(path) {
    const result = await request(path)
    if (Array.isArray(result)) return result
    if (Array.isArray(result?.content)) return result.content
    throw new ApiError('Dữ liệu trả về không phải danh sách', 0)
  }

  return { request, getList }
}

export const apiClient = createClient(apiConfig)
