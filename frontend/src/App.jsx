import { createContext, useContext, useEffect, useState } from 'react'
import { HashRouter, Navigate, NavLink, Outlet, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { defaultUsers, loadData } from './lib/data'
import { loadState, saveState } from './lib/storage'
import { applyMutation } from './lib/mutations'
import { statusMeta } from './lib/format'
import { Icon, MoonMark } from './components/Icons'
import { ToastHost } from './components/Toast'
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

const AppCtx = createContext(null)
export const useApp = () => useContext(AppCtx)

const NAV = [
  { label: 'Tổng quan', items: [['/', 'Bảng điều khiển', 'dashboard'], ['/statistics', 'Thống kê', 'stats']] },
  { label: 'Quản lý cư dân', items: [['/households', 'Hộ gia đình', 'home'], ['/residents', 'Nhân khẩu', 'users'], ['/changes', 'Biến đổi nhân khẩu', 'swap']] },
  { label: 'Thu phí', items: [['/fees', 'Khoản thu', 'receipt'], ['/payments', 'Thu phí', 'wallet', 'pending'], ['/vehicles', 'Phí gửi xe', 'car'], ['/bills', 'Thu hộ điện, nước', 'bolt']] },
  { label: 'Hệ thống', items: [['/account', 'Tài khoản', 'settings']] }
]

function AppProvider({ children }) {
  const [data, setData] = useState(null)
  const [users, setUsers] = useState([])
  const [user, setUser] = useState(null)
  const [source, setSource] = useState('demo')
  const [apiError, setApiError] = useState(null)
  const [ready, setReady] = useState(false)
  const [toasts, setToasts] = useState([])
  const [globalSearch, setGlobalSearch] = useState('')
  const [paymentFeeFilter, setPaymentFeeFilter] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    let alive = true
    const stored = loadState()
    if (stored.user) setUser(stored.user)
    setUsers(stored.users || defaultUsers())
    loadData().then(({ data: loaded, source: from, error }) => {
      if (!alive) return
      // Keep local edits when offline; the API is authoritative when reachable.
      setData(from === 'api' ? loaded : (stored.data || loaded))
      setSource(from)
      setApiError(error)
      setReady(true)
    })
    return () => { alive = false }
  }, [])

  useEffect(() => {
    if (ready) saveState({ data, users, user })
  }, [data, users, user, ready])

  const notify = (message, tone = 'ok') => {
    const id = Date.now() + Math.random()
    setToasts((prev) => [...prev, { id, message, tone }])
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3600)
  }

  // All writes go through here. When write endpoints exist, call the API with
  // writePath(resource, id) from lib/resources, then apply the mutation locally.
  const commit = (resource, mutation) => setData((prev) => applyMutation(prev, resource, mutation))
  const nextId = (list) => list.reduce((m, x) => Math.max(m, Number(x.id) || 0), 0) + 1

  const login = (username, password) => {
    const found = users.find((u) => u.username === username)
    if (!found || found.password !== password || found.status !== 'ACTIVE') return false
    const { password: _hidden, ...safe } = found
    setUser(safe)
    notify(`Chào mừng ${safe.fullName}`)
    return true
  }

  const register = (form) => {
    const username = String(form.username || '').trim()
    if (!username || !form.fullName || !form.password) { notify('Nhập đủ thông tin bắt buộc', 'err'); return false }
    if (String(form.password).length < 6) { notify('Mật khẩu phải có ít nhất 6 ký tự', 'err'); return false }
    if (users.some((u) => u.username === username)) { notify('Tên đăng nhập đã tồn tại', 'err'); return false }
    if (form.password !== form.confirm) { notify('Mật khẩu xác nhận không khớp', 'err'); return false }
    const created = {
      id: nextId(users), username, password: form.password,
      fullName: form.fullName, email: String(form.email || '').trim(),
      phone: String(form.phone || '').trim(), role: 'MANAGER', status: 'ACTIVE'
    }
    setUsers((prev) => [...prev, created])
    const { password: _hidden, ...safe } = created
    setUser(safe)
    notify('Tài khoản đã được tạo')
    navigate('/')
    return true
  }

  const logout = () => { setUser(null); notify('Đã đăng xuất', 'info'); navigate('/login') }

  const updateProfile = (form) => {
    const next = { ...user, fullName: form.fullName, email: form.email, phone: form.phone }
    setUser(next)
    setUsers((prev) => prev.map((u) => (u.id === next.id ? { ...u, ...next } : u)))
    notify('Đã lưu thông tin cá nhân')
  }

  const changePassword = (form) => {
    const stored = users.find((u) => u.id === user.id)
    if (!stored || stored.password !== form.old) { notify('Mật khẩu hiện tại không đúng', 'err'); return false }
    if (form.next !== form.confirm) { notify('Mật khẩu xác nhận không khớp', 'err'); return false }
    setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, password: form.next } : u)))
    notify('Đã đổi mật khẩu')
    return true
  }

  const value = {
    data, users, user, source, apiError, ready, toasts, globalSearch, setGlobalSearch,
    paymentFeeFilter, setPaymentFeeFilter,
    notify, commit, nextId, login, register, logout, updateProfile, changePassword
  }
  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>
}

function Shell() {
  const { data, user, source, apiError, logout, setGlobalSearch } = useApp()
  const [open, setOpen] = useState(false)
  const [term, setTerm] = useState('')
  const location = useLocation()
  const navigate = useNavigate()
  const pending = data.payments.filter((p) => p.status !== 'PAID').length
  const current = NAV.flatMap((g) => g.items).find((i) => i[0] === location.pathname)
  const initials = user.fullName.split(' ').filter(Boolean).slice(-2).map((w) => w[0]).join('').toUpperCase()

  const onSearch = (e) => {
    if (e.key !== 'Enter') return
    setGlobalSearch(e.target.value)
    navigate('/households')
  }

  return (
    <div className="app">
      <a className="skip-link" href="#app-content">Bỏ qua đến nội dung chính</a>
      <aside className={`sidebar ${open ? 'open' : ''}`}>
        <div className="brand">
          <div className="brand-mark"><MoonMark /></div>
          <div><div className="brand-name">BlueMoon</div><span className="brand-caption">QUẢN LÝ CHUNG CƯ</span></div>
        </div>
        <nav className="nav">
          {NAV.map((group) => (
            <div className="nav-group" key={group.label}>
              <div className="nav-label">{group.label}</div>
              {group.items.map(([to, label, icon, badge]) => (
                <NavLink key={to} to={to} end={to === '/'} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                  <Icon name={icon} size={18} />
                  <span>{label}</span>
                  {badge === 'pending' && pending > 0 && <span className="nav-count">{pending}</span>}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>
        <div className="sidebar-foot">
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
            <span className={`badge ${source === 'api' ? 'green' : 'gold'}`}
              title={apiError ? Object.entries(apiError).map(([k, v]) => `${k}: ${v}`).join('\n') : undefined}>
              {source === 'api' ? 'Kết nối máy chủ' : 'Dữ liệu mẫu'}
            </span>
          </div>
          <div className="user-chip">
            <div className="avatar">{initials}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="u-name" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.fullName}</div>
              <div className="u-role">{statusMeta(user.role)[0]}</div>
            </div>
            <button className="icon-btn" onClick={logout} aria-label="Đăng xuất" title="Đăng xuất"><Icon name="logout" size={17} /></button>
          </div>
        </div>
      </aside>
      <div className="main">
        <header className="topbar">
          <button className="icon-btn menu-toggle" onClick={() => setOpen(!open)} aria-label="Mở menu" aria-expanded={open}>
            <Icon name="menu" size={20} />
          </button>
          <div className="crumb">BlueMoon <span style={{ margin: '0 6px' }}>/</span> <strong>{current ? current[1] : 'Tổng quan'}</strong></div>
          <div className="topbar-spacer" />
          <label className="search"><Icon name="search" size={16} />
            <input value={term} onChange={(e) => setTerm(e.target.value)} onKeyDown={onSearch}
              placeholder="Tìm kiếm nhanh…" aria-label="Tìm kiếm nhanh" />
          </label>
          <div className="period-pill"><Icon name="calendar" size={15} />Tháng <strong>10/2026</strong></div>
          <div className="avatar" style={{ width: 32, height: 32, flex: '0 0 32px' }}>{initials}</div>
        </header>
        <main className="content" id="app-content"><Outlet /></main>
      </div>
    </div>
  )
}

function Protected({ children }) {
  const { user, ready } = useApp()
  if (!ready) return <div className="loading">Đang tải dữ liệu…</div>
  if (!user) return <Navigate to="/login" replace />
  return children
}

function AppRoutes() {
  const { toasts } = useApp()
  return (
    <>
      <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<Protected><Shell /></Protected>}>
            <Route index element={<Dashboard />} />
            <Route path="households" element={<Households />} />
            <Route path="residents" element={<Residents />} />
            <Route path="changes" element={<Changes />} />
            <Route path="fees" element={<Fees />} />
            <Route path="payments" element={<Payments />} />
            <Route path="vehicles" element={<Vehicles />} />
            <Route path="bills" element={<Bills />} />
            <Route path="statistics" element={<Statistics />} />
            <Route path="account" element={<Account />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
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
