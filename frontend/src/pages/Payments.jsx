import { useEffect, useState } from 'react'
import { useApp } from '../App'
import { Empty, Field, FilterSelect, FormGrid, KV, PageHead, SelectField, Stat, StatusBadge, TableFoot, TextArea, Toolbar } from '../components/ui'
import { Modal } from '../components/Modal'
import { date, money } from '../lib/format'

export default function Payments() {
  const { data, users, user, paymentFeeFilter, setPaymentFeeFilter, commit, notify } = useApp()
  const [search, setSearch] = useState('')
  const [fee, setFee] = useState(paymentFeeFilter)
  const [status, setStatus] = useState('')
  const [modal, setModal] = useState(null)

  // The filter from a fee card applies to this visit only.
  useEffect(() => { setPaymentFeeFilter('') }, [setPaymentFeeFilter])
  const household = (id) => data.households.find((h) => h.id === id)
  const feeOf = (id) => data.fees.find((f) => f.id === id)
  const userName = (id) => users.find((u) => u.id === id)?.fullName || '—'

  const term = search.trim().toLowerCase()
  const rows = data.payments.filter((p) => {
    const h = household(p.householdId), f = feeOf(p.feeId)
    return (!status || p.status === status) && (!fee || String(p.feeId) === fee) &&
      (!term || [h?.ownerName, h?.householdCode, f?.name].some((v) => String(v || '').toLowerCase().includes(term)))
  })
  const due = rows.reduce((s, p) => s + Number(p.amountDue || 0), 0)
  const paid = rows.reduce((s, p) => s + Number(p.amountPaid || 0), 0)
  const selected = modal?.id ? data.payments.find((p) => p.id === modal.id) : null
  const close = () => setModal(null)

  const collect = (form) => {
    const amount = Number(form.amount || 0)
    if (amount <= 0) { notify('Số tiền thu phải lớn hơn 0', 'err'); return false }
    const total = Number(selected.amountPaid || 0) + amount
    const dueAmount = Number(selected.amountDue || 0)
    commit('payments', {
      type: 'update', id: selected.id,
      patch: {
        amountPaid: total,
        status: dueAmount === 0 || total >= dueAmount ? 'PAID' : 'PARTIAL',
        paymentDate: new Date().toISOString(), paymentMethod: form.paymentMethod,
        collectedBy: user.id, note: String(form.note || '').trim()
      }
    })
    notify(`Đã ghi nhận ${money(amount)}`)
  }

  return (
    <>
      <PageHead title="Thu phí" sub="Phiếu nộp tiền của các hộ gia đình" />
      <div className="grid grid-3" style={{ marginBottom: 18 }}>
        <Stat icon="wallet" tone="gold" label="Phải thu" value={money(due)} />
        <Stat icon="checkCircle" tone="green" label="Đã nộp" value={money(paid)} />
        <Stat icon="clock" tone="red" label="Còn thiếu" value={money(due - paid)} />
      </div>
      <section className="card">
        <Toolbar value={search} onChange={setSearch} placeholder="Tìm chủ hộ, mã hộ, khoản thu…"
          filter={<>
            <FilterSelect label="Lọc khoản thu" value={fee} onChange={setFee}
              options={[['', 'Tất cả khoản thu']].concat(data.fees.map((f) => [String(f.id), f.name]))} />
            <FilterSelect label="Lọc trạng thái" value={status} onChange={setStatus}
              options={[['', 'Tất cả trạng thái'], ['UNPAID', 'Chưa nộp'], ['PARTIAL', 'Nộp một phần'], ['PAID', 'Đã nộp']]} />
          </>} />
        <div className="table-wrap">
          <table className="data">
            <thead><tr>
              <th>Hộ gia đình</th><th>Khoản thu</th><th className="num">Phải thu</th><th className="num">Đã nộp</th>
              <th>Ngày nộp</th><th>Phương thức</th><th>Trạng thái</th><th className="num">Thao tác</th>
            </tr></thead>
            <tbody>
              {rows.length ? rows.map((p) => (
                <tr key={p.id}>
                  <td className="cell-main">{household(p.householdId)?.ownerName || '—'}
                    <div className="cell-sub">{household(p.householdId)?.householdCode}, {household(p.householdId)?.apartmentNumber}</div></td>
                  <td>{feeOf(p.feeId)?.name || '—'}</td>
                  <td className="num">{money(p.amountDue)}</td>
                  <td className="num" style={{ fontWeight: 600 }}>{money(p.amountPaid)}</td>
                  <td>{date(p.paymentDate)}</td>
                  <td>{p.paymentMethod === 'BANK_TRANSFER' ? 'Chuyển khoản' : 'Tiền mặt'}</td>
                  <td><StatusBadge value={p.status} /></td>
                  <td><div className="row-actions">
                    {p.status !== 'PAID' && <button className="mini-btn accent" onClick={() => setModal({ type: 'collect', id: p.id })}>Thu tiền</button>}
                    <button className="mini-btn" onClick={() => setModal({ type: 'view', id: p.id })}>Chi tiết</button>
                  </div></td>
                </tr>
              )) : <tr><td colSpan={8}><Empty title="Không tìm thấy phiếu thu" hint="Thử thay đổi từ khóa hoặc bộ lọc." /></td></tr>}
            </tbody>
          </table>
        </div>
        <TableFoot shown={rows.length} total={data.payments.length} />
      </section>

      {modal?.type === 'collect' && selected && (
        <Modal title="Ghi nhận thu tiền" confirmText="Xác nhận thu" onClose={close} onConfirm={collect}>
          <KV pairs={[
            ['Hộ gia đình', household(selected.householdId)?.ownerName || '—'],
            ['Khoản thu', feeOf(selected.feeId)?.name || '—'],
            ['Phải thu', money(selected.amountDue)],
            ['Đã nộp', money(selected.amountPaid)]
          ]} />
          <FormGrid>
            <Field label="Số tiền thu (đ)" name="amount" type="number" step="1000"
              value={Math.max(0, Number(selected.amountDue || 0) - Number(selected.amountPaid || 0)) || ''} required />
            <SelectField label="Phương thức" name="paymentMethod" value={selected.paymentMethod}
              options={[['CASH', 'Tiền mặt'], ['BANK_TRANSFER', 'Chuyển khoản']]} />
            <TextArea label="Ghi chú" name="note" value={selected.note} />
          </FormGrid>
        </Modal>
      )}

      {modal?.type === 'view' && selected && (
        <Modal title="Chi tiết phiếu thu" confirmText="Đóng" onClose={close}>
          <KV pairs={[
            ['Hộ gia đình', household(selected.householdId)?.ownerName || '—'],
            ['Khoản thu', feeOf(selected.feeId)?.name || '—'],
            ['Phải thu', money(selected.amountDue)],
            ['Đã nộp', money(selected.amountPaid)],
            ['Ngày nộp', date(selected.paymentDate)],
            ['Phương thức', selected.paymentMethod === 'BANK_TRANSFER' ? 'Chuyển khoản' : 'Tiền mặt'],
            ['Người thu', userName(selected.collectedBy)],
            ['Trạng thái', <StatusBadge value={selected.status} />],
            ['Ghi chú', selected.note || '—']
          ]} />
        </Modal>
      )}
    </>
  )
}
