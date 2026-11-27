import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useApp } from '../App'
import { apiClient } from '../lib/apiClient'
import { getToken, isTokenExpired, roleHome } from '../lib/auth'
import { actionMethod, actionPath } from '../lib/resources'
import { Icon, MoonMark } from '../components/Icons'

const EMPTY_FORM = { fullName: '', username: '', phone: '', password: '' }

export default function Register() {
  const { user, notify } = useApp()
  const navigate = useNavigate()
  const [form, setForm] = useState(EMPTY_FORM)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (user && getToken() && !isTokenExpired()) return <Navigate to={roleHome(user.role)} replace />

  const setField = (field) => (event) => setForm((prev) => ({ ...prev, [field]: event.target.value }))

  const submit = async (event) => {
    event.preventDefault()
    setError('')

    const fullName = form.fullName.trim()
    const username = form.username.trim()
    const phone = form.phone.trim()

    if (!fullName) {
      setError('Nhập họ và tên.')
      return
    }
    if (!username) {
      setError('Nhập tên đăng nhập.')
      return
    }
    if (!phone) {
      setError('Nhập số điện thoại.')
      return
    }
    if (form.password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự.')
      return
    }

    setSubmitting(true)
    try {
      await apiClient.request(actionPath('auth', 'register'), {
        method: actionMethod('auth', 'register'),
        body: { username, password: form.password, fullName, phone }
      })
      notify('Đăng ký thành công, hãy đăng nhập.')
      navigate('/login', { replace: true })
    } catch (err) {
      setError(err.fieldErrors?.[0]?.message || err.message || 'Đăng ký không thành công.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="login-page">
      <a className="skip-link" href="#register-form"
        onClick={(event) => { event.preventDefault(); document.getElementById('rg-name')?.focus() }}>
        Bỏ qua đến biểu mẫu đăng ký
      </a>
      <section className="login-art" data-enter>
        <div className="brand">
          <div className="brand-mark"><MoonMark /></div>
          <div><div className="brand-name">BlueMoon</div><span className="brand-caption">QUẢN LÝ CHUNG CƯ</span></div>
        </div>
        <div className="login-pitch">
          <h1>Tạo tài khoản<br />cư dân BlueMoon</h1>
          <p>Tự đăng ký tài khoản để dùng cổng cư dân: tra cứu hóa đơn, gửi phản ánh và đăng ký gửi xe.</p>
          <div className="login-feats">
            <span><Icon name="check" size={15} />Hóa đơn của hộ</span>
            <span><Icon name="check" size={15} />Gửi phản ánh</span>
            <span><Icon name="check" size={15} />Đăng ký gửi xe</span>
          </div>
        </div>
        <div className="foot-note">BlueMoon Apartment · Ngã tư Văn Phú · Đưa vào sử dụng 2023</div>
      </section>

      <section className="login-panel">
        <div className="login-box">
          <h2>Đăng ký</h2>
          <p className="lead">Tạo tài khoản cư dân. Ban quản trị sẽ liên kết tài khoản với căn hộ của bạn.</p>
          <form id="register-form" onSubmit={submit} noValidate>
            <div className="field">
              <label htmlFor="rg-name">Họ và tên</label>
              <input id="rg-name" name="fullName" autoComplete="name" value={form.fullName}
                onChange={setField('fullName')} placeholder="Nhập họ và tên" required />
            </div>
            <div className="field">
              <label htmlFor="rg-user">Tên đăng nhập</label>
              <input id="rg-user" name="username" autoComplete="username" value={form.username}
                onChange={setField('username')} placeholder="Nhập tên đăng nhập" required />
            </div>
            <div className="field">
              <label htmlFor="rg-phone">Số điện thoại</label>
              <input id="rg-phone" name="phone" type="tel" autoComplete="tel" value={form.phone}
                onChange={setField('phone')} placeholder="Nhập số điện thoại" required />
            </div>
            <div className="field">
              <label htmlFor="rg-pass">Mật khẩu</label>
              <input id="rg-pass" name="password" type="password" autoComplete="new-password" value={form.password}
                onChange={setField('password')} placeholder="Nhập mật khẩu" required />
              <span className="hint">Tối thiểu 6 ký tự.</span>
            </div>
            <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
              <Icon name="check" size={16} />{submitting ? 'Đang tạo tài khoản…' : 'Tạo tài khoản'}
            </button>
          </form>
          {error && <div className="login-error" role="alert">{error}</div>}
          <p style={{ marginTop: 18, textAlign: 'center', fontSize: 13, color: 'var(--text-muted)' }}>
            Đã có tài khoản?{' '}
            <Link to="/login" style={{ color: 'var(--moon-deep)', fontWeight: 600 }}>Đăng nhập</Link>
          </p>
        </div>
      </section>
    </div>
  )
}
