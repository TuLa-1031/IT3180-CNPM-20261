// Display helpers and enum labels shared by every screen.

export const num = (value) => Number(value || 0).toLocaleString('vi-VN')

export const money = (value) => `${num(value)} ₫`

export function date(value) {
  if (!value) return '—'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return String(value)
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`
}

export function datetime(value) {
  if (!value) return '—'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return String(value)
  return `${date(d)} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

export const STATUS = {
  ACTIVE: ['Đang hoạt động', 'green'],
  INACTIVE: ['Ngừng hoạt động', 'gray'],
  MOVED_OUT: ['Đã chuyển đi', 'gray'],
  UNPAID: ['Chưa nộp', 'red'],
  PARTIAL: ['Nộp một phần', 'gold'],
  PAID: ['Đã nộp', 'green'],
  OPEN: ['Đang thu', 'blue'],
  CLOSED: ['Đã kết thúc', 'gray'],
  PERMANENT: ['Thường trú', 'green'],
  TEMPORARY_RESIDENCE: ['Tạm trú', 'blue'],
  TEMPORARY_ABSENCE: ['Tạm vắng', 'gold'],
  MOVE_IN: ['Chuyển đến', 'green'],
  MOVE_OUT: ['Chuyển đi', 'gray'],
  ADMIN: ['Quản trị viên', 'blue'],
  MANAGER: ['Ban quản trị', 'blue'],
  ACCOUNTANT: ['Kế toán', 'gold']
}

export const FEE_TYPE = {
  SERVICE: ['Phí dịch vụ', 'blue'],
  MANAGEMENT: ['Phí quản lý', 'gold'],
  CONTRIBUTION: ['Đóng góp', 'green'],
  PARKING: ['Gửi xe', 'blue'],
  UTILITY: ['Thu hộ', 'gold']
}

export const CHANGE_TYPE = {
  TEMPORARY_RESIDENCE: ['Tạm trú', 'blue'],
  TEMPORARY_ABSENCE: ['Tạm vắng', 'gold'],
  MOVE_IN: ['Chuyển đến', 'green'],
  MOVE_OUT: ['Chuyển đi', 'gray']
}

export const SERVICE_TYPE = {
  ELECTRICITY: ['Tiền điện', 'gold'],
  WATER: ['Tiền nước', 'blue'],
  INTERNET: ['Internet', 'green']
}

export const statusMeta = (value) => STATUS[value] || [value || '—', 'gray']
