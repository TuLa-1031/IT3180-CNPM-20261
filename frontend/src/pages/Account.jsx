import { useState } from 'react'
import { useApp } from '../App'
import { Badge, Field, FormGrid, Icon, PageHead } from '../components/ui'
import { STATUS } from '../lib/format'

export default function Account() {
  const { user, updateProfile, changePassword } = useApp()
  const [profile, setProfile] = useState({ fullName: user.fullName, email: user.email || '', phone: user.phone || '' })
  const [password, setPassword] = useState({ old: '', next: '', confirm: '' })
  const role = STATUS[user.role] || [user.role, 'blue']

  const saveProfile = (e) => {
    e.preventDefault()
    updateProfile(profile)
  }
  const savePassword = (e) => {
    e.preventDefault()
    if (changePassword(password)) setPassword({ old: '', next: '', confirm: '' })
  }

  return (
    <>
      <PageHead title="Tài khoản" sub="Thông tin cá nhân và đổi mật khẩu" />
      <div className="grid grid-2">
        <section className="card">
          <div className="card-head"><div><h3>Thông tin cá nhân</h3><p>Chỉnh sửa thông tin hiển thị của bạn</p></div>
            <Badge text={role[0]} tone={role[1]} /></div>
          <form className="card-body" onSubmit={saveProfile}>
            <FormGrid>
              <Field label="Tên đăng nhập" name="username" value={user.username} disabled full />
              <Field label="Họ và tên" name="fullName" value={profile.fullName}
                onChange={(e) => setProfile({ ...profile, fullName: e.target.value })} required full />
              <Field label="Email" name="email" type="email" value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })} />
              <Field label="Điện thoại" name="phone" value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })} />
              <Field label="Chức vụ" name="role" value={role[0]} disabled full />
            </FormGrid>
            <div style={{ marginTop: 20, textAlign: 'right' }}><button type="submit" className="btn btn-primary">Lưu thông tin</button></div>
          </form>
        </section>
        <section className="card">
          <div className="card-head"><div><h3>Đổi mật khẩu</h3><p>Sử dụng mật khẩu mới để đăng nhập lần sau</p></div></div>
          <form className="card-body" onSubmit={savePassword}>
            <div className="field"><label htmlFor="pw-old">Mật khẩu hiện tại</label>
              <input id="pw-old" name="old" type="password" required value={password.old}
                onChange={(e) => setPassword({ ...password, old: e.target.value })} /></div>
            <div className="field" style={{ marginTop: 14 }}><label htmlFor="pw-new">Mật khẩu mới</label>
              <input id="pw-new" name="next" type="password" minLength={6} required value={password.next}
                onChange={(e) => setPassword({ ...password, next: e.target.value })} /></div>
            <div className="field" style={{ marginTop: 14 }}><label htmlFor="pw-confirm">Xác nhận mật khẩu mới</label>
              <input id="pw-confirm" name="confirm" type="password" minLength={6} required value={password.confirm}
                onChange={(e) => setPassword({ ...password, confirm: e.target.value })} /></div>
            <div style={{ marginTop: 20, textAlign: 'right' }}>
              <button type="submit" className="btn btn-ghost"><Icon name="check" size={16} />Cập nhật mật khẩu</button>
            </div>
          </form>
        </section>
      </div>
    </>
  )
}
