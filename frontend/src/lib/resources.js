// Resource registry: the ONLY place that knows backend paths, actions and response shapes.
// Thêm endpoint mới = thêm một entry ở đây + normalizer nếu shape khác.
const n = (v) => (v === null || v === undefined || v === '' ? null : Number(v))
const z = (v) => Number(v ?? 0)
const b = (v) => v === true || v === 'true' || v === 1

const listOf = (payload) => {
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.content)) return payload.content
  return payload === null || payload === undefined ? [] : [payload]
}

const mapRows = (fn) => (payload) => listOf(payload).map(fn)

export const RESOURCES = {
  // ----- Xác thực, tài khoản ------------------------------------------------
  auth: {
    path: '/auth',
    actions: {
      login: { method: 'POST', path: '/auth/login' },
      register: { method: 'POST', path: '/auth/register' },
      me: { method: 'GET', path: '/auth/me' },
      password: { method: 'PUT', path: '/auth/password' }
    }
  },
  users: {
    path: '/users',
    normalize: mapRows((r) => ({ ...r, id: n(r.id), residentId: n(r.residentId) })),
    actions: {
      status: { method: 'PATCH', path: (id) => `/users/${id}/status` }
    }
  },

  // ----- UC01: hộ gia đình, nhân khẩu, biến động ---------------------------
  households: {
    path: '/households',
    normalize: mapRows((r) => ({
      ...r, id: n(r.id), floor: z(r.floor), area: z(r.area)
    })),
    actions: {
      residents: { method: 'GET', path: (id) => `/households/${id}/residents` }
    }
  },
  residents: {
    path: '/residents',
    normalize: mapRows((r) => ({ ...r, id: n(r.id), householdId: n(r.householdId) })),
    actions: {
      changes: { method: 'GET', path: (id) => `/residents/${id}/changes` }
    }
  },
  residenceChanges: {
    path: '/residence-changes',
    normalize: mapRows((r) => ({
      ...r, id: n(r.id), residentId: n(r.residentId), householdId: n(r.householdId), createdBy: n(r.createdBy)
    }))
  },

  // ----- UC02: khoản thu, thu phí, thu hộ ----------------------------------
  fees: {
    path: '/fees',
    normalize: mapRows((r) => ({
      ...r, id: n(r.id), unitPrice: z(r.unitPrice), billingMonth: n(r.billingMonth),
      billingYear: n(r.billingYear), isMandatory: b(r.isMandatory)
    })),
    actions: {
      generate: { method: 'POST', path: (id) => `/fees/${id}/generate` },
      close: { method: 'POST', path: (id) => `/fees/${id}/close` },
      debts: { method: 'GET', path: (id) => `/fees/${id}/debts` }
    }
  },
  payments: {
    path: '/payments',
    normalize: mapRows((r) => ({
      ...r, id: n(r.id), householdId: n(r.householdId), feeId: n(r.feeId),
      amountDue: z(r.amountDue), amountPaid: z(r.amountPaid), collectedBy: n(r.collectedBy)
    })),
    actions: {
      transactions: { method: 'GET', path: (id) => `/payments/${id}/transactions` },
      createTransaction: { method: 'POST', path: (id) => `/payments/${id}/transactions` }
    }
  },
  transactions: {
    path: '/transactions',
    normalize: mapRows((r) => ({
      ...r, id: n(r.id), paymentId: n(r.paymentId), amount: z(r.amount),
      recordedBy: n(r.recordedBy), approvedBy: n(r.approvedBy)
    })),
    actions: {
      approve: { method: 'PATCH', path: (id) => `/transactions/${id}/approve` },
      reject: { method: 'PATCH', path: (id) => `/transactions/${id}/reject` }
    }
  },
  utilityBills: {
    path: '/utility-bills',
    normalize: mapRows((r) => ({
      ...r, id: n(r.id), householdId: n(r.householdId), feeId: n(r.feeId),
      billingMonth: z(r.billingMonth), billingYear: z(r.billingYear),
      previousIndex: z(r.previousIndex), currentIndex: z(r.currentIndex),
      usageAmount: z(r.usageAmount), totalAmount: z(r.totalAmount)
    })),
    actions: {
      pay: { method: 'PATCH', path: (id) => `/utility-bills/${id}/pay` }
    }
  },

  // ----- UC03: phản ánh ----------------------------------------------------
  feedbacks: {
    path: '/feedbacks',
    normalize: mapRows((r) => ({
      ...r, id: n(r.id), householdId: n(r.householdId), residentId: n(r.residentId),
      respondedBy: n(r.respondedBy), mergedIntoId: n(r.mergedIntoId)
    })),
    actions: {
      status: { method: 'PATCH', path: (id) => `/feedbacks/${id}/status` },
      respond: { method: 'POST', path: (id) => `/feedbacks/${id}/respond` },
      merge: { method: 'POST', path: '/feedbacks/merge' }
    }
  },

  // ----- UC04: thiết bị, bảo trì, kỹ thuật viên ---------------------------
  equipment: {
    path: '/equipment',
    normalize: mapRows((r) => ({ ...r, id: n(r.id) }))
  },
  maintenanceSchedules: {
    path: '/maintenance-schedules',
    normalize: mapRows((r) => ({ ...r, id: n(r.id), equipmentId: n(r.equipmentId) }))
  },
  maintenanceTasks: {
    path: '/maintenance-tasks',
    normalize: mapRows((r) => ({
      ...r, id: n(r.id), equipmentId: n(r.equipmentId), scheduleId: n(r.scheduleId),
      technicianId: n(r.technicianId), acceptedBy: n(r.acceptedBy)
    })),
    actions: {
      assign: { method: 'PATCH', path: (id) => `/maintenance-tasks/${id}/assign` },
      status: { method: 'PATCH', path: (id) => `/maintenance-tasks/${id}/status` },
      accept: { method: 'POST', path: (id) => `/maintenance-tasks/${id}/accept` }
    }
  },
  technicians: {
    path: '/technicians',
    normalize: mapRows((r) => ({ ...r, id: n(r.id), userId: n(r.userId) }))
  },

  // ----- UC05: đăng ký gửi xe, phương tiện, thẻ ---------------------------
  vehicleRegistrations: {
    path: '/vehicle-registrations',
    normalize: mapRows((r) => ({
      ...r, id: n(r.id), householdId: n(r.householdId), vehicleId: n(r.vehicleId),
      requestedBy: n(r.requestedBy), processedBy: n(r.processedBy)
    })),
    actions: {
      approve: { method: 'PATCH', path: (id) => `/vehicle-registrations/${id}/approve` },
      reject: { method: 'PATCH', path: (id) => `/vehicle-registrations/${id}/reject` }
    }
  },
  vehicles: {
    path: '/vehicles',
    normalize: mapRows((r) => ({ ...r, id: n(r.id), householdId: n(r.householdId), monthlyFee: z(r.monthlyFee) })),
    actions: {
      status: { method: 'PATCH', path: (id) => `/vehicles/${id}/status` }
    }
  },
  parkingCards: {
    path: '/parking-cards',
    normalize: mapRows((r) => ({ ...r, id: n(r.id), vehicleId: n(r.vehicleId), replacedById: n(r.replacedById) })),
    actions: {
      lock: { method: 'PATCH', path: (id) => `/parking-cards/${id}/lock` },
      reissue: { method: 'PATCH', path: (id) => `/parking-cards/${id}/reissue` }
    }
  },

  // ----- Dùng chung: thông báo, thống kê ----------------------------------
  notifications: {
    path: '/notifications',
    normalize: mapRows((r) => ({ ...r, id: n(r.id), userId: n(r.userId), isRead: b(r.isRead) })),
    actions: {
      read: { method: 'PATCH', path: (id) => `/notifications/${id}/read` },
      readAll: { method: 'PATCH', path: '/notifications/read-all' }
    }
  },
  health: {
    path: '/health'
  },
  stats: {
    path: '/stats',
    actions: {
      overview: { method: 'GET', path: '/stats/overview' },
      revenue: { method: 'GET', path: '/stats/revenue' },
      debts: { method: 'GET', path: '/stats/debts' },
      feedbacks: { method: 'GET', path: '/stats/feedbacks' },
      maintenance: { method: 'GET', path: '/stats/maintenance' },
      residents: { method: 'GET', path: '/stats/residents' }
    }
  }
}

// Chỉ các resource cũ đang được App tải sẵn để các trang hiện tại còn chạy.
export const resourceKeys = [
  'households', 'residents', 'residenceChanges', 'fees', 'payments', 'vehicles', 'utilityBills'
]

export const allResourceKeys = Object.keys(RESOURCES)

export function listPath(resource, params = {}) {
  const entry = RESOURCES[resource]
  if (!entry) throw new Error(`Unknown resource: ${resource}`)
  const query = new URLSearchParams(
    Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== '')
  ).toString()
  return query ? `${entry.path}?${query}` : entry.path
}

export function entityPath(resource, id) {
  const entry = RESOURCES[resource]
  if (!entry) throw new Error(`Unknown resource: ${resource}`)
  return id === undefined || id === null ? entry.path : `${entry.path}/${id}`
}

export function actionPath(resource, action, id) {
  const entry = RESOURCES[resource]?.actions?.[action]
  if (!entry) throw new Error(`Unknown action: ${resource}.${action}`)
  return typeof entry === 'function' ? entry(id) : entry.path
}

export function actionMethod(resource, action) {
  const entry = RESOURCES[resource]?.actions?.[action]
  if (!entry) throw new Error(`Unknown action: ${resource}.${action}`)
  return entry.method || 'POST'
}

/** Giữ tương thích với các trang cũ: đường dẫn ghi cơ bản. */
export function writePath(resource, id) {
  return entityPath(resource, id)
}

export function normalizeMany(resource, payload) {
  const normalize = RESOURCES[resource]?.normalize
  return normalize ? normalize(payload) : listOf(payload)
}

export function normalizeOne(resource, payload) {
  if (payload === null || payload === undefined) return null
  return normalizeMany(resource, payload)[0] ?? null
}
