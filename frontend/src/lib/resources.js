// Resource registry: the ONLY place that knows backend paths and response shapes.
// Adding a new resource = add one entry here (plus a normalizer if its shape differs).
const n = (v) => (v === null || v === undefined || v === '' ? null : Number(v))
const z = (v) => Number(v ?? 0)
const b = (v) => v === true || v === 'true' || v === 1

export const RESOURCES = {
  households: {
    path: '/households',
    normalize: (rows) => rows.map((r) => ({ ...r, id: n(r.id), floor: z(r.floor), area: z(r.area) }))
  },
  residents: {
    path: '/residents',
    normalize: (rows) => rows.map((r) => ({ ...r, id: n(r.id), householdId: n(r.householdId) }))
  },
  residenceChanges: {
    path: '/residence-changes',
    normalize: (rows) => rows.map((r) => ({
      ...r, id: n(r.id), residentId: n(r.residentId), householdId: n(r.householdId), createdBy: n(r.createdBy)
    }))
  },
  fees: {
    path: '/fees',
    normalize: (rows) => rows.map((r) => ({
      ...r, id: n(r.id), unitPrice: z(r.unitPrice), billingMonth: n(r.billingMonth),
      billingYear: n(r.billingYear), isMandatory: b(r.isMandatory)
    }))
  },
  payments: {
    path: '/payments',
    normalize: (rows) => rows.map((r) => ({
      ...r, id: n(r.id), householdId: n(r.householdId), feeId: n(r.feeId),
      amountDue: z(r.amountDue), amountPaid: z(r.amountPaid), collectedBy: n(r.collectedBy)
    }))
  },
  vehicles: {
    path: '/vehicles',
    normalize: (rows) => rows.map((r) => ({ ...r, id: n(r.id), householdId: n(r.householdId), monthlyFee: z(r.monthlyFee) }))
  },
  utilityBills: {
    path: '/utility-bills',
    normalize: (rows) => rows.map((r) => ({
      ...r, id: n(r.id), householdId: n(r.householdId), feeId: n(r.feeId),
      billingMonth: z(r.billingMonth), billingYear: z(r.billingYear),
      previousIndex: z(r.previousIndex), currentIndex: z(r.currentIndex),
      usageAmount: z(r.usageAmount), totalAmount: z(r.totalAmount)
    }))
  }
}

export const resourceKeys = Object.keys(RESOURCES)

// Reserved for the future write endpoints (POST /resource, PUT /resource/:id).
export function writePath(resource, id) {
  const base = RESOURCES[resource]?.path
  if (!base) throw new Error(`Unknown resource: ${resource}`)
  return id === undefined || id === null ? base : `${base}/${id}`
}
