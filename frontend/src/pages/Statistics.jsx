import { useApp } from '../App'
import { Donut, PageHead, Stat } from '../components/ui'
import { FEE_TYPE, money } from '../lib/format'

const COLORS = { SERVICE: '#5B86E5', MANAGEMENT: '#E3B165', CONTRIBUTION: '#2F9E78', PARKING: '#7C6FE8', UTILITY: '#4BA6A6' }

export default function Statistics() {
  const { data } = useApp()
  const due = data.payments.reduce((s, p) => s + Number(p.amountDue || 0), 0)
  const paid = data.payments.reduce((s, p) => s + Number(p.amountPaid || 0), 0)
  const rate = due ? Math.round(paid / due * 100) : 0
  const counts = { PAID: 0, PARTIAL: 0, UNPAID: 0 }
  data.payments.forEach((p) => { counts[p.status] = (counts[p.status] || 0) + 1 })
  const n = data.payments.length || 1
  const segments = [
    { color: '#2F9E78', value: Math.round(counts.PAID / n * 360) },
    { color: '#E3B165', value: Math.round(counts.PARTIAL / n * 360) },
    { color: '#D96363', value: Math.round(counts.UNPAID / n * 360) }
  ].filter((s) => s.value > 0)

  const byType = {}
  data.fees.forEach((fee) => {
    byType[fee.feeType] = (byType[fee.feeType] || 0) +
      data.payments.filter((p) => p.feeId === fee.id).reduce((s, p) => s + Number(p.amountPaid || 0), 0)
  })
  const max = Math.max(1, ...Object.values(byType))
  const top = data.households.map((h) => ({
    h, paid: data.payments.filter((p) => p.householdId === h.id).reduce((s, p) => s + Number(p.amountPaid || 0), 0)
  })).sort((a, b) => b.paid - a.paid).slice(0, 5)

  return (
    <>
      <PageHead title="Thống kê" sub="Tổng hợp thu phí theo loại và trạng thái" />
      <div className="grid grid-4" style={{ marginBottom: 18 }}>
        <Stat icon="wallet" tone="green" label="Tổng đã thu" value={money(paid)} />
        <Stat icon="stats" tone="blue" label="Tỷ lệ thu" value={`${rate}%`} note={`Trên ${data.payments.length} phiếu`} />
        <Stat icon="clock" tone="red" label="Còn phải thu" value={money(due - paid)} />
        <Stat icon="receipt" tone="gold" label="Khoản thu" value={data.fees.length} note={`${data.fees.filter((f) => f.status === 'OPEN').length} đang mở`} />
      </div>
      <div className="grid grid-2">
        <section className="card">
          <div className="card-head"><div><h3>Thu theo loại khoản</h3><p>Tổng số tiền đã nộp</p></div></div>
          <div className="card-body">
            <div className="bar-chart">
              {Object.keys(byType).map((k) => (
                <div className="bar-col" key={k}>
                  <div className="bar-stack">
                    <div className="bar" style={{
                      height: Math.max(4, Math.round(byType[k] / max * 150)),
                      background: `linear-gradient(180deg,${COLORS[k] || '#94A3B8'},${COLORS[k] || '#94A3B8'}88)`
                    }} />
                  </div>
                  <div className="bar-label">{(FEE_TYPE[k] || [k])[0]}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
        <section className="card">
          <div className="card-head"><div><h3>Trạng thái phiếu thu</h3><p>Phân bổ theo tình trạng nộp tiền</p></div></div>
          <div className="card-body" style={{ display: 'flex', gap: 26, alignItems: 'center', justifyContent: 'center' }}>
            <Donut segments={segments} top={`${counts.PAID}/${data.payments.length}`} bottom="Đã nộp" />
            <div className="donut-legend" style={{ flex: 1 }}>
              <div className="legend-item"><span className="legend-dot" style={{ background: '#2F9E78' }} />Đã nộp<span className="legend-val">{counts.PAID}</span></div>
              <div className="legend-item"><span className="legend-dot" style={{ background: '#E3B165' }} />Nộp một phần<span className="legend-val">{counts.PARTIAL}</span></div>
              <div className="legend-item"><span className="legend-dot" style={{ background: '#D96363' }} />Chưa nộp<span className="legend-val">{counts.UNPAID}</span></div>
            </div>
          </div>
        </section>
      </div>
      <section className="card" style={{ marginTop: 18 }}>
        <div className="card-head"><div><h3>Hộ đóng góp nhiều nhất</h3><p>Xếp theo tổng số tiền đã nộp</p></div></div>
        <div className="card-body" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 32px' }}>
          {top.map((t, i) => (
            <div className="list-row" key={t.h.id}>
              <span className="dot" style={{ background: i === 0 ? 'var(--gold)' : 'var(--moon)' }} />
              <div><div className="lr-main">{t.h.ownerName}</div><div className="lr-sub">Căn hộ {t.h.apartmentNumber}</div></div>
              <div className="lr-val">{money(t.paid)}</div>
            </div>
          ))}
        </div>
      </section>
    </>
  )
}
