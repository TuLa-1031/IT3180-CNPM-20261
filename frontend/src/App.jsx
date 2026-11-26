import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { HashRouter, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { defaultUsers, loadData } from './lib/data'
import { applyMutation } from './lib/mutations'
import { apiClient } from './lib/apiClient'
import { canStaffAccess, clearToken, getToken, isResidentRole, isStaffRole, isTokenExpired, roleHome, setToken } from './lib/auth'
import { ToastHost } from './components/Toast'
import AdminLayout from './app/AdminLayout'
import ResidentLayout from './app/ResidentLayout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Households from './pages/Households'
import Residents from './pages/Residents'
import Changes from './pages/Changes'
import Fees from './pages/Fees'
import Payments from './pages/Payments'
import Vehicles from './pages/Vehicles'
import Bills from './pages/Bills'
import Statistics from './pages/Statistics'
import Account from './pages/Account'
import TemplatePage from './features/_template/pages/TemplatePage'
import { resourceKeys } from './lib/resources'

const AppCtx = createContext(null)
export const useApp = () => useContext(AppCtx)

// Kỹ thuật/cư dân không tải dữ liệu tài chính cũ; trang của họ dùng API riêng ở GĐ sau.
const DATA_KEYS_BY_ROLE = {
  ADMIN: resourceKeys,
  MANAGER: resourceKeys,
  ACCOUNTANT: resourceKeys,
  TECHNICIAN: [],
  RESIDENT: []
}

function AppProvider({ children }) {
  const [data, setData] = useState(null)
  const [users, setUsers] = useState([])
  const [user, setUser] = useState(null)
  const [source, setSource] = useState('demo')
  const [apiError, setApiError] = useState(null)
  const [ready, setReady] = useState(false)
  const [authReady, setAuthReady] = useState(false)
  const [toasts, setToasts] = useState([])
  const [globalSearch, setGlobalSearch] = useState('')
  const [paymentFeeFilter, setPaymentFeeFilter] = useState('')
  const navigate = useNavigate()

  const notify = (message, tone = 'ok') => {
    const id = Date.now() + Math.random()
    setToasts((prev) => [...prev, { id, message, tone }])
    setTimeout(() => setToasts((prev) => prev.filter((toast) => toast.id !== id)), 3600)
  }

  // Khôi phục phiên từ token: hỏi /auth/me để chắc tài khoản còn hiệu lực.
  useEffect(() => {
    let alive = true
    const token = getToken()
    if (!token || isTokenExpired(token)) {
      clearToken()
      setAuthReady(true)
      return undefined
    }
    apiClient.request('/auth/me')
      .then((profile) => { if (alive) setUser(profile) })
      .catch(() => { if (alive) { clearToken(); setUser(null) } })
      .finally(() => { if (alive) setAuthReady(true) })
    return () => { alive = false }
  }, [])

  // Token hết hạn ở bất kỳ request nào -> thoát phiên, đưa về trang đăng nhập.
  const sessionExpired = useCallback(() => {
    clearToken()
    setUser(null)
    setData(null)
    setReady(false)
    setAuthReady(true)
    navigate('/login', { replace: true })
  }, [navigate])

  useEffect(() => {
    window.addEventListener('bluemoon:unauthorized', sessionExpired)
    return () => window.removeEventListener('bluemoon:unauthorized', sessionExpired)
  }, [sessionExpired])

  const userId = user?.id
  const userRole = user?.role

  // Dữ liệu nghiệp vụ: nạp sau khi đăng nhập, chỉ các resource vai trò được đọc.
  // Trang cũ dùng chung context này cho tới khi chuyển sang features/<domain>/api.js.
  useEffect(() => {
    if (!userId) {
      setData(null)
      setUsers([])
      setReady(false)
      return undefined
    }
    let alive = true
    setReady(false)
    loadData(DATA_KEYS_BY_ROLE[userRole] || []).then(({ data: loaded, source: from, error }) => {
      if (!alive) return
      setData(loaded)
      setUsers(defaultUsers())
      setSource(from)
      setApiError(error)
      setReady(true)
    })
    return () => { alive = false }
  }, [userId, userRole])

  const login = async (username, password) => {
    const result = await apiClient.request('/auth/login', {
      method: 'POST',
      body: { username, password }
    })
    setToken(result.token)
    setUser(result.user)
    notify(`Chào mừng ${result.user.fullName}`)
    return result.user
  }

  const logout = () => {
    clearToken()
    setUser(null)
    setData(null)
    setReady(false)
    notify('Đã đăng xuất', 'info')
    navigate('/login', { replace: true })
  }

  const changePassword = async (form) => {
    if (form.next !== form.confirm) {
      notify('Mật khẩu xác nhận không khớp', 'err')
      return false
    }
    try {
      await apiClient.request('/auth/password', {
        method: 'PUT',
        body: { oldPassword: form.old, newPassword: form.next }
      })
      notify('Đã đổi mật khẩu')
      return true
    } catch (err) {
      notify(err.message || 'Không đổi được mật khẩu', 'err')
      return false
    }
  }

  const updateProfile = (form) => {
    setUser((prev) => ({ ...prev, fullName: form.fullName, email: form.email, phone: form.phone }))
    notify('Đã cập nhật thông tin hiển thị')
  }

  // Các trang cũ vẫn ghi tạm vào state cho tới khi API ghi của từng UC sẵn sàng.
  const commit = (resource, mutation) => setData((prev) => applyMutation(prev, resource, mutation))
  const nextId = (list) => list.reduce((max, row) => Math.max(max, Number(row.id) || 0), 0) + 1

  const value = {
    data, users, user, source, apiError, ready, authReady, toasts,
    globalSearch, setGlobalSearch, paymentFeeFilter, setPaymentFeeFilter,
    notify, commit, nextId, login, logout, sessionExpired, updateProfile, changePassword
  }

  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>
}

function Protected({ role, children }) {
  const { user, authReady, ready, sessionExpired } = useApp()
  const location = useLocation()
  const token = getToken()
  const validSession = Boolean(token) && !isTokenExpired(token)

  useEffect(() => {
    if (authReady && user && !validSession) sessionExpired()
  }, [authReady, user, validSession, sessionExpired])

  if (!authReady) return <div className="loading">Đang kiểm tra đăng nhập…</div>
  if (!user || !validSession) return <Navigate to="/login" replace />
  if (role === 'staff' && !isStaffRole(user.role)) return <Navigate to="/resident" replace />
  if (role === 'staff' && !canStaffAccess(user.role, location.pathname)) {
    return <Navigate to={roleHome(user.role)} replace />
  }
  if (role === 'resident' && !isResidentRole(user.role)) return <Navigate to="/admin" replace />
  if (!ready) return <div className="loading">Đang tải dữ liệu…</div>
  return children
}

function HomeRedirect() {
  const { user, authReady } = useApp()
  if (!authReady) return <div className="loading">Đang kiểm tra đăng nhập…</div>
  return <Navigate to={user ? roleHome(user.role) : '/login'} replace />
}

function Placeholder({ title, sub }) {
  return (
    <TemplatePage
      title={title}
      sub={sub}
      initialRows={[]}
      readOnly
      emptyTitle="Màn hình đang được hoàn thiện"
      emptyHint="Phân hệ này sẽ được nối API ở giai đoạn sau."
    />
  )
}

function AppRoutes() {
  const { toasts } = useApp()
  return (
    <>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<HomeRedirect />} />

        {/* Khung nhân viên: route phẳng theo path đã chốt cho từng UC. */}
        <Route element={<Protected role="staff"><AdminLayout /></Protected>}>
          <Route path="/admin" element={<Dashboard />} />
          <Route path="/statistics" element={<Statistics />} />
          <Route path="/households" element={<Households />} />
          <Route path="/residents" element={<Residents />} />
          <Route path="/changes" element={<Changes />} />
          <Route path="/fees" element={<Fees />} />
          <Route path="/payments" element={<Payments />} />
          <Route path="/bills" element={<Bills />} />
          <Route path="/feedbacks" element={<Placeholder title="Phản ánh" sub="Tiếp nhận, phân loại và phản hồi yêu cầu của cư dân" />} />
          <Route path="/equipment" element={<Placeholder title="Thiết bị" sub="Danh mục thiết bị cần bảo trì trong chung cư" />} />
          <Route path="/maintenance" element={<Navigate to="/maintenance-tasks" replace />} />
          <Route path="/maintenance-schedules" element={<Placeholder title="Lịch bảo trì" sub="Lịch bảo trì định kỳ theo thiết bị" />} />
          <Route path="/maintenance-tasks" element={<Placeholder title="Công việc bảo trì" sub="Phân công và theo dõi tiến độ công việc" />} />
          <Route path="/vehicles" element={<Vehicles />} />
          <Route path="/vehicles/registrations" element={<Placeholder title="Đăng ký gửi xe" sub="Duyệt yêu cầu đăng ký gửi xe của cư dân" />} />
          <Route path="/vehicles/cards" element={<Placeholder title="Thẻ gửi xe" sub="Cấp, khóa và cấp lại thẻ gửi xe" />} />
          <Route path="/account" element={<Account />} />
          <Route path="/template" element={<TemplatePage />} />
        </Route>

        <Route path="/resident" element={<Protected role="resident"><ResidentLayout /></Protected>}>
          <Route index element={<Navigate to="/resident/bills" replace />} />
          <Route path="bills" element={<Placeholder title="Hóa đơn" sub="Hóa đơn và công nợ của hộ gia đình bạn" />} />
          <Route path="feedbacks" element={<Placeholder title="Phản ánh" sub="Gửi và theo dõi phản ánh của bạn" />} />
          <Route path="vehicles" element={<Placeholder title="Gửi xe" sub="Đăng ký gửi xe và xem thẻ gửi xe" />} />
          <Route path="notifications" element={<Placeholder title="Thông báo" sub="Thông báo từ Ban quản trị" />} />
        </Route>

        <Route path="*" element={<HomeRedirect />} />
      </Routes>
      <ToastHost toasts={toasts} />
    </>
  )
}

export default function App() {
  return (
    <HashRouter>
      <AppProvider>
        <AppRoutes />
      </AppProvider>
    </HashRouter>
  )
}
