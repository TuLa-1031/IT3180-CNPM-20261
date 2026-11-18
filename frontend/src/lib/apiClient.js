// Transport only: URL building, timeout and JSON parsing. No domain knowledge.
export class ApiError extends Error {
  constructor(message, status = 0) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

export function createClient({ baseUrl, timeout = 1500 }) {
  async function request(path, options = {}) {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), timeout)
    try {
      const response = await fetch(baseUrl + path, { ...options, signal: controller.signal })
      if (!response.ok) throw new ApiError(`HTTP ${response.status}`, response.status)
      return await response.json()
    } catch (err) {
      if (err.name === 'AbortError') throw new ApiError('Request timeout', 0)
      throw err instanceof ApiError ? err : new ApiError(err.message || 'Network error', 0)
    } finally {
      clearTimeout(timer)
    }
  }

  async function getList(path) {
    const result = await request(path)
    if (!Array.isArray(result)) throw new ApiError('Expected a JSON array', 0)
    return result
  }

  return { request, getList }
}
