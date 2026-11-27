import { useState } from 'react'
import { Navigate, Link, useNavigate } from 'react-router-dom'
import { useApp } from '../App'
import { getToken, isTokenExpired, roleHome } from '../lib/auth'
import { Icon, MoonMark } from '../components/Icons'

export default function Login() {
  const { user, login } = useApp()
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (user && getToken() && !isTokenExpired()) return <Navigate to={roleHome(user.role)} replace />

  const submit = async (event) => {
    event.preventDefault()
    setError('')
    if (!username.trim() || !password) {
      setError('Nhập tên đăng nhập và mật khẩu.')
      return
    }
    setSubmitting(true)
    try {
      const account = await login(username.trim(), password)
      navigate(roleHome(account.role), { replace: true })
    } catch (err) {
      setError(err.message || 'Đăng nhập không thành công.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="login-page">
      <a className="skip-link" href="#login-form">Bỏ qua đến biểu mẫu đăng nhập</a>
      <section className="login-art" data-enter>
        <div className="brand">
          <div className="brand-mark"><MoonMark /></div>
          <div><div className="brand-name">BlueMoon</div><span className="brand-caption">QUẢN LÝ CHUNG CƯ</span></div>
        </div>
        <div className="login-pitch">
          <h1>Phần mềm quản lý<br />chung cư BlueMoon</h1>
          <p>Quản lý hộ khẩu, nhân khẩu và các khoản thu phí tại một nơi. Dùng được sau khi đăng nhập vào hệ thống.</p>
          <div className="login-feats">
            <span><Icon name="check" size={15} />Quản lý hộ gia đình</span>
            <span><Icon name="check" size={15} />Theo dõi khoản thu</span>
            <span><Icon name="check" size={15} />Thống kê trực quan</span>
          </div>
        </div>
        <div className="foot-note">BlueMoon Apartment · Ngã tư Văn Phú · Đưa vào sử dụng 2023</div>
      </section>

      <section className="login-panel">
        <div className="login-box">
          <h2>Đăng nhập</h2>
          <p className="lead">Dùng tài khoản do Ban quản trị cung cấp.</p>
          <form id="login-form" onSubmit={submit} noValidate>
            <div className="field">
              <label htmlFor="lg-user">Tên đăng nhập</label>
              <input id="lg-user" name="username" autoComplete="username" value={username}
                onChange={(event) => setUsername(event.target.value)} placeholder="Nhập tên đăng nhập" required />
            </div>
            <div className="field">
              <label htmlFor="lg-pass">Mật khẩu</label>
              <input id="lg-pass" name="password" type="password" autoComplete="current-password" value={password}
                onChange={(event) => setPassword(event.target.value)} placeholder="Nhập mật khẩu" required />
            </div>
            <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
              <Icon name="logout" size={16} />{submitting ? 'Đang đăng nhập…' : 'Đăng nhập'}
            </button>
          </form>
          {error && <div className="login-error" role="alert">{error}</div>}
          <p style={{ marginTop: 16, textAlign: 'center', fontSize: 13, color: 'var(--text-muted)' }}>
            Chưa có tài khoản?{' '}
            <Link to="/register" style={{ color: 'var(--moon-deep)', fontWeight: 600 }}>Đăng ký</Link>
          </p>
          <div className="login-hint">
            <strong>Tài khoản dùng thử (mật khẩu 123456):</strong><br />
            admin · quanly · ketoan · kythuat · cudan
          </div>
        </div>
      </section>
    </div>
  )
}
