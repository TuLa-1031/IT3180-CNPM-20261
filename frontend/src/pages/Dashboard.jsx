import { useNavigate } from 'react-router-dom'
import { useApp } from '../App'
import { Icon } from '../components/Icons'
import { Donut, Empty, PageHead, Stat } from '../components/ui'
import { datetime, money, num } from '../lib/format'

const TYPE_COLORS = { SERVICE: '#5B86E5', MANAGEMENT: '#E3B165', CONTRIBUTION: '#2F9E78', PARKING: '#7C6FE8', UTILITY: '#4BA6A6' }
const TYPE_LABELS = { SERVICE: 'Phí dịch vụ', MANAGEMENT: 'Phí quản lý', CONTRIBUTION: 'Đóng góp', PARKING: 'Gửi xe', UTILITY: 'Thu hộ' }

function FeeProgress({ fees, payments }) {
  if (!fees.length) return <Empty title="Chưa có khoản thu" hint="Tạo khoản thu để bắt đầu theo dõi." />
  return fees.map((fee) => {
    const rows = payments.filter((p) => p.feeId === fee.id)
    const due = rows.reduce((s, p) => s + Number(p.amountDue || 0), 0)
    const paid = rows.reduce((s, p) => s + Number(p.amountPaid || 0), 0)
    const pct = due ? Math.round(paid / due * 100) : 0
    return (
      <div key={fee.id} style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginBottom: 6 }}>
          <span style={{ fontSize: 12.5, fontWeight: 600 }}>{fee.name.replace(' tháng', ' · Tháng')}</span>
          <span className="tabular" style={{ fontSize: 12, color: 'var(--text-muted)' }}>{pct}%</span>
        </div>
        <div className="progress-line"><span style={{ width: `${pct}%` }} /></div>
        <div style={{ fontSize: 12, color: 'var(--text-faint)', marginTop: 4 }}>{money(paid)} / {money(due)}</div>
      </div>
    )
  })
}

export default function Dashboard() {
  const { data } = useApp()
  const navigate = useNavigate()
  const monthFees = data.fees.filter((x) => x.billingMonth === 10 && x.billingYear === 2026)
  const ids = monthFees.map((x) => x.id)
  const monthPayments = data.payments.filter((p) => ids.includes(p.feeId))
  const due = monthPayments.reduce((s, p) => s + Number(p.amountDue || 0), 0)
  const paid = monthPayments.reduce((s, p) => s + Number(p.amountPaid || 0), 0)
  const target = due ? Math.round(paid / due * 100) : 0

  const recent = data.payments.filter((p) => p.paymentDate)
    .sort((a, b) => String(b.paymentDate).localeCompare(String(a.paymentDate))).slice(0, 5)
  const household = (id) => data.households.find((x) => x.id === id)
  const feeOf = (id) => data.fees.find((x) => x.id === id)

  const byType = {}
  data.fees.forEach((fee) => {
    const rows = data.payments.filter((p) => p.feeId === fee.id)
    byType[fee.feeType] = (byType[fee.feeType] || 0) + rows.reduce((s, p) => s + Number(p.amountPaid || 0), 0)
  })
  const totalType = Object.values(byType).reduce((s, v) => s + v, 0) || 1
  const segments = Object.keys(byType).map((k) => ({
    color: TYPE_COLORS[k] || '#94A3B8', value: Math.round(byType[k] / totalType * 360)
  })).filter((s) => s.value > 0)

  return (
    <>
      <PageHead title="Tổng quan" sub="Tình hình thu phí và hộ gia đình tháng 10/2026" />
      <div className="grid grid-hero" style={{ marginBottom: 18 }}>
        <section className="hero" data-enter>
          <div className="hero-copy">
            <div className="hero-eyebrow"><Icon name="moon" size={14} />Báo cáo tháng 10/2026</div>
            <h2 className="hero-title">Tình hình thu phí<br />tháng 10/2026</h2>
            <p className="hero-text">
              {monthPayments.filter((p) => p.status === 'PAID').length} phiếu đã nộp. Đã thu {money(paid)} trong tổng số {money(due)}.
            </p>
            <div className="hero-actions">
              <button className="btn btn-gold" onClick={() => navigate('/payments')}><Icon name="wallet" size={16} />Thu phí</button>
              <button className="btn btn-ghost" onClick={() => navigate('/fees')}><Icon name="plus" size={16} />Tạo khoản thu</button>
            </div>
          </div>
          <div className="ring-wrap">
            <div className="ring" style={{ '--pct': target }}>
              <div className="ring-inner"><div className="ring-num">{target}<small>%</small></div><div className="ring-label">Tỷ lệ thu</div></div>
            </div>
            <div className="ring-caption">{monthPayments.filter((p) => p.status === 'PAID').length}/{monthPayments.length} phiếu đã nộp</div>
          </div>
        </section>
        <div className="grid" style={{ gridTemplateColumns: '1fr', gap: 14 }}>
          <Stat icon="home" tone="blue" label="Hộ gia đình" value={data.households.length} note="Tất cả đang hoạt động" noteTone="up" />
          <Stat icon="users" tone="gold" label="Nhân khẩu" value={data.residents.length} note={`Trên ${data.households.length} hộ gia đình`} />
          <Stat icon="checkCircle" tone="green" label="Đã thu tháng này" value={money(paid)} note={`Tỷ lệ ${target}%`} noteTone="up" />
          <Stat icon="clock" tone="red" label="Còn phải thu" value={money(due - paid)} note="Cần nhắc nhở các hộ" noteTone="down" />
        </div>
      </div>

      <div className="grid grid-2">
        <section className="card">
          <div className="card-head"><div><h3>Tiến độ theo khoản thu</h3><p>Tháng 10/2026, tổng phải thu và đã thu</p></div>
            <button className="mini-btn" onClick={() => navigate('/fees')}>Xem tất cả</button></div>
          <div className="card-body"><FeeProgress fees={monthFees} payments={data.payments} /></div>
        </section>
        <section className="card">
          <div className="card-head"><div><h3>Cơ cấu nguồn thu</h3><p>Theo loại khoản thu</p></div></div>
          <div className="card-body" style={{ display: 'flex', gap: 24, alignItems: 'center', justifyContent: 'center' }}>
            <Donut segments={segments} top={`${num(Math.round(totalType / 1000000))}tr`} bottom="Tổng thu" />
            <div className="donut-legend" style={{ flex: 1 }}>
              {Object.keys(byType).map((k) => (
                <div className="legend-item" key={k}>
                  <span className="legend-dot" style={{ background: TYPE_COLORS[k] || '#94A3B8' }} />
                  {TYPE_LABELS[k] || k}<span className="legend-val">{num(Math.round(byType[k] / 1000))}k</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      <section className="card" style={{ marginTop: 18 }}>
        <div className="card-head"><div><h3>Phiếu thu gần đây</h3><p>Các giao dịch mới nhất được ghi nhận</p></div>
          <button className="mini-btn" onClick={() => navigate('/payments')}>Xem danh sách</button></div>
        <div className="card-body" style={{ paddingTop: 6, paddingBottom: 6 }}>
          {recent.map((p) => {
            const h = household(p.householdId), fee = feeOf(p.feeId)
            const color = p.status === 'PAID' ? 'var(--success)' : p.status === 'PARTIAL' ? 'var(--gold)' : 'var(--danger)'
            return (
              <div className="list-row" key={p.id}>
                <span className="dot" style={{ background: color }} />
                <div><div className="lr-main">{h ? h.ownerName : '—'}</div>
                  <div className="lr-sub">{fee ? fee.name : '—'}, {datetime(p.paymentDate)}</div></div>
                <div className="lr-val">{money(p.amountPaid)}</div>
              </div>
            )
          })}
        </div>
      </section>
    </>
  )
}
