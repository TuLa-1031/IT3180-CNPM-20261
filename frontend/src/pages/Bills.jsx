import { useState } from 'react'
import { useApp } from '../App'
import { Badge, Empty, Field, FilterSelect, FormGrid, Icon, PageHead, SelectField, StatusBadge, TableFoot, TextArea, Toolbar } from '../components/ui'
import { Modal } from '../components/Modal'
import { SERVICE_TYPE, money } from '../lib/format'

export default function Bills() {
  const { data, commit, nextId, notify } = useApp()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [adding, setAdding] = useState(false)
  const household = (id) => data.households.find((h) => h.id === id)
  const term = search.trim().toLowerCase()
  const rows = data.utilityBills.filter((b) =>
    (!status || b.paymentStatus === status) &&
    (!term || [household(b.householdId)?.ownerName, b.providerName, SERVICE_TYPE[b.serviceType]?.[0]]
      .some((v) => String(v || '').toLowerCase().includes(term))))

  const pay = (bill) => {
    commit('utilityBills', { type: 'update', id: bill.id, patch: { paymentStatus: 'PAID', paidAt: new Date().toISOString() } })
    notify('Đã ghi nhận thu hộ')
  }

  const save = (form) => {
    const prev = Number(form.previousIndex || 0), curr = Number(form.currentIndex || 0)
    commit('utilityBills', {
      type: 'create',
      entity: {
        id: nextId(data.utilityBills), householdId: Number(form.householdId), feeId: null,
        serviceType: form.serviceType, billingMonth: Number(form.billingMonth), billingYear: Number(form.billingYear),
        previousIndex: prev, currentIndex: curr, usageAmount: Math.max(0, curr - prev),
        totalAmount: Number(form.totalAmount || 0), providerName: String(form.providerName || '').trim(),
        paymentStatus: 'UNPAID', paidAt: null, note: String(form.note || '').trim()
      }
    })
    notify('Đã thêm hóa đơn')
  }

  return (
    <>
      <PageHead title="Thu hộ điện, nước, internet" sub="Hóa đơn thu hộ theo thông báo của đơn vị cung cấp">
        <button className="btn btn-primary" onClick={() => setAdding(true)}><Icon name="plus" size={16} />Thêm hóa đơn</button>
      </PageHead>
      <section className="card">
        <Toolbar value={search} onChange={setSearch} placeholder="Tìm chủ hộ, nhà cung cấp…"
          filter={<FilterSelect label="Lọc trạng thái" value={status} onChange={setStatus}
            options={[['', 'Tất cả trạng thái'], ['UNPAID', 'Chưa nộp'], ['PAID', 'Đã nộp']]} />} />
        <div className="table-wrap">
          <table className="data">
            <thead><tr>
              <th>Hộ gia đình</th><th>Dịch vụ</th><th>Kỳ</th><th className="num">Chỉ số</th><th className="num">Tiêu thụ</th>
              <th className="num">Thành tiền</th><th>Nhà cung cấp</th><th>Trạng thái</th><th className="num">Thao tác</th>
            </tr></thead>
            <tbody>
              {rows.length ? rows.map((b) => {
                const meta = SERVICE_TYPE[b.serviceType] || [b.serviceType, 'gray']
                return (
                  <tr key={b.id}>
                    <td className="cell-main">{household(b.householdId)?.ownerName || '—'}
                      <div className="cell-sub">{household(b.householdId)?.apartmentNumber}</div></td>
                    <td><Badge text={meta[0]} tone={meta[1]} /></td>
                    <td>{b.billingMonth}/{b.billingYear}</td>
                    <td className="num">{b.previousIndex} → {b.currentIndex}</td>
                    <td className="num">{b.usageAmount}</td>
                    <td className="num" style={{ fontWeight: 600 }}>{money(b.totalAmount)}</td>
                    <td>{b.providerName || '—'}</td>
                    <td><StatusBadge value={b.paymentStatus} /></td>
                    <td><div className="row-actions">
                      {b.paymentStatus !== 'PAID' && <button className="mini-btn accent" onClick={() => pay(b)}>Đã thu</button>}
                    </div></td>
                  </tr>
                )
              }) : <tr><td colSpan={9}><Empty title="Không tìm thấy hóa đơn" hint="Thử thay đổi từ khóa hoặc bộ lọc." /></td></tr>}
            </tbody>
          </table>
        </div>
        <TableFoot shown={rows.length} total={data.utilityBills.length} />
      </section>

      {adding && (
        <Modal title="Thêm hóa đơn thu hộ" wide onClose={() => setAdding(false)} onConfirm={save}>
          <FormGrid>
            <SelectField label="Hộ gia đình" name="householdId"
              options={data.households.map((h) => [h.id, `${h.householdCode}, ${h.apartmentNumber}, ${h.ownerName}`])} />
            <SelectField label="Dịch vụ" name="serviceType"
              options={[['ELECTRICITY', 'Tiền điện'], ['WATER', 'Tiền nước'], ['INTERNET', 'Internet']]} />
            <Field label="Tháng" name="billingMonth" type="number" value={new Date().getMonth() + 1} min={1} max={12} required />
            <Field label="Năm" name="billingYear" type="number" value={new Date().getFullYear()} required />
            <Field label="Chỉ số trước" name="previousIndex" type="number" value={0} min={0} />
            <Field label="Chỉ số hiện tại" name="currentIndex" type="number" value={0} min={0} />
            <Field label="Thành tiền (đ)" name="totalAmount" type="number" step="1000" value={0} />
            <Field label="Nhà cung cấp" name="providerName" />
            <TextArea label="Ghi chú" name="note" />
          </FormGrid>
        </Modal>
      )}
    </>
  )
}
