// Token helpers only: storage, payload decoding and role routing.
// Business data never lives here — see lib/apiClient.js and lib/resources.js.
const TOKEN_KEY = 'bluemoon_token'

function readToken() {
  try {
    return localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

export function getToken() {
  return readToken()
}

export function setToken(token) {
  try {
    localStorage.setItem(TOKEN_KEY, token)
  } catch {
    /* storage unavailable: session lasts until reload */
  }
}

export function clearToken() {
  try {
    localStorage.removeItem(TOKEN_KEY)
  } catch {
    /* noop */
  }
}

export function decodeToken(token = readToken()) {
  if (!token) return null
  try {
    const payload = token.split('.')[1]
    if (!payload) return null
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/')
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=')
    const bytes = Uint8Array.from(atob(padded), (char) => char.charCodeAt(0))
    return JSON.parse(new TextDecoder().decode(bytes))
  } catch {
    return null
  }
}

export function isTokenExpired(token = readToken()) {
  const payload = decodeToken(token)
  if (!payload?.exp) return true
  return payload.exp * 1000 <= Date.now()
}

/** Payload còn hạn hay null; token hỏng/hết hạn bị xóa khỏi localStorage. */
export function getSession() {
  const token = readToken()
  if (!token) return null
  const payload = decodeToken(token)
  if (!payload || !payload.exp || payload.exp * 1000 <= Date.now()) {
    clearToken()
    return null
  }
  return payload
}

export const STAFF_ROLES = ['ADMIN', 'MANAGER', 'ACCOUNTANT', 'TECHNICIAN']

export const isStaffRole = (role) => STAFF_ROLES.includes(role)

export const isResidentRole = (role) => role === 'RESIDENT'

// Ma trận quyền §2.2: null = toàn bộ khu vực nhân viên.
const STAFF_AREA_ACCESS = {
  ADMIN: null,
  MANAGER: null,
  ACCOUNTANT: [
    '/admin', '/statistics',
    '/households', '/residents', '/changes',
    '/fees', '/payments', '/bills',
    '/vehicles', '/vehicles/registrations', '/vehicles/cards',
    '/account', '/template'
  ],
  TECHNICIAN: [
    '/feedbacks',
    '/equipment', '/maintenance', '/maintenance-schedules', '/maintenance-tasks',
    '/account', '/template'
  ]
}

/** Có được mở path này trong Admin Portal không (chỉ kiểm tra điều hướng/UI). */
export function canStaffAccess(role, path) {
  if (!isStaffRole(role)) return false
  const allowed = STAFF_AREA_ACCESS[role]
  if (allowed === null) return true
  if (!allowed) return false
  return allowed.some((prefix) => path === prefix || path.startsWith(`${prefix}/`))
}

/** Trang chủ theo vai trò: cư dân vào cổng cư dân, kỹ thuật vào việc bảo trì. */
export function roleHome(role) {
  if (isResidentRole(role)) return '/resident'
  if (role === 'TECHNICIAN') return '/maintenance-tasks'
  return '/admin'
}
