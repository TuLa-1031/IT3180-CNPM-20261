import { useMemo, useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { useApp } from '../App'
import { Icon, MoonMark } from '../components/Icons'
import { statusMeta } from '../lib/format'

const NAV = [
  ['/resident/bills', 'Hóa đơn', 'receipt'],
  ['/resident/feedbacks', 'Phản ánh', 'info'],
  ['/resident/vehicles', 'Gửi xe', 'car'],
  ['/resident/notifications', 'Thông báo', 'alert']
]

export default function ResidentLayout() {
  const { user, logout } = useApp()
  const [open, setOpen] = useState(false)
  const location = useLocation()

  const current = useMemo(
    () => NAV.find(([to]) => location.pathname === to || location.pathname.startsWith(`${to}/`)),
    [location.pathname]
  )
  const initials = (user?.fullName || user?.username || '?')
    .split(' ').filter(Boolean).slice(-2).map((word) => word[0]).join('').toUpperCase()

  return (
    <div className="app">
      <a className="skip-link" href="#app-content">Bỏ qua đến nội dung chính</a>
      <aside className={`sidebar ${open ? 'open' : ''}`}>
        <div className="brand">
          <div className="brand-mark"><MoonMark /></div>
          <div><div className="brand-name">BlueMoon</div><span className="brand-caption">CỔNG CƯ DÂN</span></div>
        </div>
        <nav className="nav" aria-label="Menu cư dân">
          <div className="nav-group">
            <div className="nav-label">Cư dân</div>
            {NAV.map(([to, label, icon]) => (
              <NavLink key={to} to={to}
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                onClick={() => setOpen(false)}>
                <Icon name={icon} size={18} />
                <span>{label}</span>
              </NavLink>
            ))}
          </div>
        </nav>
        <div className="sidebar-foot">
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
          <div className="crumb">BlueMoon <span style={{ margin: '0 6px' }}>/</span> <strong>{current ? current[1] : 'Hóa đơn'}</strong></div>
          <div className="topbar-spacer" />
          <div className="avatar" style={{ width: 32, height: 32, flex: '0 0 32px' }}>{initials}</div>
        </header>
        <main className="content" id="app-content"><Outlet /></main>
      </div>
    </div>
  )
}
