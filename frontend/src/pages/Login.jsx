import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useApp } from '../App'
import { Icon, MoonMark } from '../components/Icons'
import { Modal } from '../components/Modal'
import { Field, FormGrid } from '../components/ui'

export default function Login() {
  const { user, login, register } = useApp()
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [showRegister, setShowRegister] = useState(false)

  if (user) return <Navigate to="/" replace />

  const submit = (e) => {
    e.preventDefault()
    if (!login(username, password)) setError('Tên đăng nhập hoặc mật khẩu không đúng.')
    else navigate('/')
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
                onChange={(e) => setUsername(e.target.value)} placeholder="Nhập tên đăng nhập" required />
            </div>
            <div className="field">
              <label htmlFor="lg-pass">Mật khẩu</label>
              <input id="lg-pass" name="password" type="password" autoComplete="current-password" value={password}
                onChange={(e) => setPassword(e.target.value)} placeholder="Nhập mật khẩu" required />
            </div>
            <button type="submit" className="btn btn-primary btn-block"><Icon name="logout" size={16} />Đăng nhập</button>
          </form>
          {error && <div className="login-error">{error}</div>}
          <button type="button" className="btn btn-quiet btn-block" style={{ marginTop: 10 }} onClick={() => setShowRegister(true)}>
            Chưa có tài khoản? Đăng ký
          </button>
          <div className="login-hint">
            <strong>Tài khoản dùng thử:</strong> admin / 123456 hoặc ketoan / 123456.<br />
            Dữ liệu được lấy từ máy chủ backend nếu có, ngược lại dùng dữ liệu mẫu.
          </div>
        </div>
      </section>

      {showRegister && (
        <Modal title="Đăng ký tài khoản" wide confirmText="Tạo tài khoản"
          onClose={() => setShowRegister(false)} onConfirm={(data) => register(data)}>
          <FormGrid>
            <Field label="Tên đăng nhập" name="username" required />
            <Field label="Họ và tên" name="fullName" required />
            <Field label="Mật khẩu" name="password" type="password" required />
            <Field label="Xác nhận mật khẩu" name="confirm" type="password" required />
            <Field label="Email" name="email" type="email" />
            <Field label="Điện thoại" name="phone" />
          </FormGrid>
        </Modal>
      )}
    </div>
  )
}
