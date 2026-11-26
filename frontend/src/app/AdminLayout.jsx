import { useMemo, useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useApp } from '../App'
import { Icon, MoonMark } from '../components/Icons'
import { statusMeta } from '../lib/format'

const NAV = [
  {
    label: 'Tổng quan',
    items: [['/admin', 'Bảng điều khiển', 'dashboard'], ['/statistics', 'Thống kê', 'stats']]
  },
  {
    label: 'Cư dân',
    items: [['/households', 'Hộ gia đình', 'home'], ['/residents', 'Nhân khẩu', 'users'], ['/changes', 'Biến động', 'swap']]
  },
  {
    label: 'Thu phí',
    items: [['/fees', 'Khoản thu', 'receipt'], ['/payments', 'Thu phí', 'wallet', 'pending'], ['/bills', 'Thu hộ điện, nước', 'bolt']]
  },
  {
    label: 'Phản ánh',
    items: [['/feedbacks', 'Phản ánh', 'info']]
  },
  {
    label: 'Bảo trì',
    items: [['/equipment', 'Thiết bị', 'settings'], ['/maintenance-schedules', 'Lịch bảo trì', 'calendar'], ['/maintenance-tasks', 'Công việc', 'checkCircle']]
  },
  {
    label: 'Gửi xe',
    items: [['/vehicles', 'Phương tiện', 'car'], ['/vehicles/registrations', 'Đăng ký gửi xe', 'receipt'], ['/vehicles/cards', 'Thẻ gửi xe', 'wallet']]
  },
  {
    label: 'Hệ thống',
    items: [['/account', 'Tài khoản', 'user'], ['/template', 'Trang mẫu', 'dashboard']]
  }
]

const FLAT = NAV.flatMap((group) => group.items)

export default function AdminLayout() {
  const { user, data, source, apiError, logout, setGlobalSearch } = useApp()
  const [open, setOpen] = useState(false)
  const [term, setTerm] = useState('')
  const location = useLocation()
  const navigate = useNavigate()

  const current = useMemo(
    () => FLAT.find(([to]) => location.pathname === to)
      || [...FLAT].sort((a, b) => b[0].length - a[0].length).find(([to]) => location.pathname.startsWith(`${to}/`)),
    [location.pathname]
  )
  const pending = data?.payments?.filter((p) => p.status !== 'PAID').length || 0
  const initials = (user?.fullName || user?.username || '?')
    .split(' ').filter(Boolean).slice(-2).map((word) => word[0]).join('').toUpperCase()

  const onSearch = (event) => {
    if (event.key !== 'Enter') return
    setGlobalSearch(event.target.value)
    setOpen(false)
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
        <nav className="nav" aria-label="Menu quản trị">
          {NAV.map((group) => (
            <div className="nav-group" key={group.label}>
              <div className="nav-label">{group.label}</div>
              {group.items.map(([to, label, icon, badge]) => (
                <NavLink key={to} to={to} end={to === '/admin'}
                  className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                  onClick={() => setOpen(false)}>
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
              title={apiError ? Object.entries(apiError).map(([key, value]) => `${key}: ${value}`).join('\n') : undefined}>
              {source === 'api' ? 'Kết nối máy chủ' : 'Dữ liệu mẫu'}
            </span>
          </div>
          <div className="user-chip">
            <div className="avatar">{initials}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="u-name" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.fullName}</div>
              <div className="u-role">{statusMeta(user?.role)[0]}</div>
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
            <input value={term} onChange={(event) => setTerm(event.target.value)} onKeyDown={onSearch}
              placeholder="Tìm hộ gia đình…" aria-label="Tìm kiếm nhanh" />
          </label>
          <div className="period-pill"><Icon name="calendar" size={15} />Tháng <strong>10/2026</strong></div>
          <div className="avatar" style={{ width: 32, height: 32, flex: '0 0 32px' }}>{initials}</div>
        </header>
        <main className="content" id="app-content"><Outlet /></main>
      </div>
    </div>
  )
}
