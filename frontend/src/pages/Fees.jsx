import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../App'
import { Badge, CheckboxField, Empty, Field, FilterSelect, FormGrid, Icon, PageHead, SelectField, StatusBadge, TextArea } from '../components/ui'
import { Modal } from '../components/Modal'
import { FEE_TYPE, date, money } from '../lib/format'

export default function Fees() {
  const { data, commit, nextId, notify, setPaymentFeeFilter } = useApp()
  const navigate = useNavigate()
  const [type, setType] = useState('')
  const [modal, setModal] = useState(null)
  const rows = data.fees.filter((f) => !type || f.feeType === type).sort((a, b) => b.id - a.id)
  const current = modal?.id ? data.fees.find((f) => f.id === modal.id) : null
  const close = () => setModal(null)

  const collect = (fee) => { setPaymentFeeFilter(String(fee.id)); navigate('/payments') }

  const save = (form) => {
    const obj = {
      feeCode: String(form.feeCode || '').trim(), name: String(form.name || '').trim(),
      feeType: form.feeType, calculationMethod: form.calculationMethod,
      unitPrice: Number(form.unitPrice || 0), isMandatory: form.isMandatory === 'on',
      billingMonth: form.billingMonth ? Number(form.billingMonth) : null,
      billingYear: form.billingYear ? Number(form.billingYear) : null,
      startDate: form.startDate, dueDate: form.dueDate, status: form.status,
      description: String(form.description || '').trim()
    }
    if (data.fees.some((f) => f.feeCode === obj.feeCode && (!current || f.id !== current.id))) {
      notify('Mã khoản thu đã tồn tại', 'err'); return false
    }
    if (current) commit('fees', { type: 'update', id: current.id, patch: obj })
    else commit('fees', { type: 'create', entity: { id: nextId(data.fees), ...obj } })
    notify(current ? 'Đã cập nhật khoản thu' : 'Đã tạo khoản thu')
  }

  return (
    <>
      <PageHead title="Khoản thu" sub="Các khoản phí và đợt đóng góp theo kỳ">
        <button className="btn btn-primary" onClick={() => setModal({ type: 'edit' })}><Icon name="plus" size={16} />Tạo khoản thu</button>
      </PageHead>
      <div className="table-toolbar" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-card)', marginBottom: 18 }}>
        <FilterSelect label="Lọc loại phí" value={type} onChange={setType}
          options={[['', 'Tất cả loại phí'], ['SERVICE', 'Phí dịch vụ'], ['MANAGEMENT', 'Phí quản lý'], ['CONTRIBUTION', 'Đóng góp'], ['PARKING', 'Gửi xe'], ['UTILITY', 'Thu hộ']]} />
        <div style={{ flex: 1 }} /><span className="muted" style={{ fontSize: 12.5 }}>{rows.length} khoản đang quản lý</span>
      </div>
      <div className="grid grid-3">
        {rows.length ? rows.map((fee) => {
          const meta = FEE_TYPE[fee.feeType] || [fee.feeType, 'gray']
          const pay = data.payments.filter((p) => p.feeId === fee.id)
          const due = pay.reduce((s, p) => s + Number(p.amountDue || 0), 0)
          const collected = pay.reduce((s, p) => s + Number(p.amountPaid || 0), 0)
          const pct = due ? Math.round(collected / due * 100) : 0
          return (
            <article className="card" key={fee.id} data-action="go-fee" onClick={() => collect(fee)}
              style={{ display: 'flex', flexDirection: 'column', minHeight: 212 }}>
              <div style={{ padding: '17px 18px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
                <span className="code">{fee.feeCode}</span><Badge text={meta[0]} tone={meta[1]} />
              </div>
              <div style={{ padding: '12px 18px 0' }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, lineHeight: 1.4 }}>{fee.name}</h3>
                <div style={{ fontSize: 12, color: 'var(--text-faint)', marginTop: 5 }}>
                  {fee.isMandatory ? 'Bắt buộc' : 'Tự nguyện'}, {fee.billingMonth ? `Tháng ${fee.billingMonth}/${fee.billingYear}` : `Năm ${fee.billingYear}`}
                </div>
              </div>
              <div style={{ padding: '14px 18px 0', display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                <span className="muted">Đơn giá</span><strong className="tabular">{fee.unitPrice ? money(fee.unitPrice) : 'Tùy đóng góp'}</strong>
              </div>
              <div style={{ padding: '10px 18px 0' }}>
                <div className="progress-line"><span style={{ width: `${pct}%` }} /></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-faint)', marginTop: 5 }}>
                  <span>Đã thu {pct}%</span><span>Hạn {date(fee.dueDate)}</span>
                </div>
              </div>
              <div style={{ marginTop: 'auto', padding: '14px 18px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                <StatusBadge value={fee.status} />
                <div className="row-actions">
                  <button className="mini-btn accent" onClick={(e) => { e.stopPropagation(); collect(fee) }}>Thu phí</button>
                  <button className="mini-btn" onClick={(e) => { e.stopPropagation(); setModal({ type: 'edit', id: fee.id }) }}>Sửa</button>
                </div>
              </div>
            </article>
          )
        }) : <div style={{ gridColumn: '1/-1' }}><Empty title="Chưa có khoản thu" hint="Tạo khoản thu đầu tiên để bắt đầu thu phí." /></div>}
      </div>

      {modal?.type === 'edit' && (
        <Modal title={current ? 'Sửa khoản thu' : 'Tạo khoản thu mới'} wide onClose={close} onConfirm={save}>
          <FormGrid>
            <Field label="Mã khoản thu" name="feeCode" value={current?.feeCode} placeholder="DV-2026-12" required />
            <Field label="Tên khoản thu" name="name" value={current?.name} required />
            <SelectField label="Loại phí" name="feeType" value={current?.feeType || 'SERVICE'}
              options={[['SERVICE', 'Phí dịch vụ'], ['MANAGEMENT', 'Phí quản lý'], ['CONTRIBUTION', 'Đóng góp'], ['PARKING', 'Gửi xe'], ['UTILITY', 'Thu hộ']]} />
            <SelectField label="Tính tiền theo" name="calculationMethod" value={current?.calculationMethod || 'PER_AREA'}
              options={[['PER_AREA', 'Theo diện tích (đ/m²)'], ['FIXED', 'Số tiền cố định'], ['BY_VEHICLE', 'Theo phương tiện'], ['BY_USAGE', 'Theo tiêu thụ'], ['VOLUNTARY', 'Tự nguyện']]} />
            <Field label="Đơn giá (đ)" name="unitPrice" type="number" step="1000" value={current?.unitPrice ?? 0} />
            <CheckboxField label="Khoản thu bắt buộc" name="isMandatory" checked={current ? current.isMandatory : true} />
            <Field label="Tháng" name="billingMonth" type="number" min={1} max={12} value={current?.billingMonth} />
            <Field label="Năm" name="billingYear" type="number" value={current?.billingYear} />
            <Field label="Ngày bắt đầu" name="startDate" type="date" value={current?.startDate} />
            <Field label="Hạn nộp" name="dueDate" type="date" value={current?.dueDate} />
            <SelectField label="Trạng thái" name="status" value={current?.status || 'OPEN'}
              options={[['OPEN', 'Đang thu'], ['CLOSED', 'Đã kết thúc']]} />
            <TextArea label="Mô tả" name="description" value={current?.description} />
          </FormGrid>
        </Modal>
      )}
    </>
  )
}
