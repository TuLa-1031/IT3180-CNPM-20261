import { useState } from 'react'
import { useApp } from '../App'
import { Empty, Field, FormGrid, Icon, PageHead, SelectField, Stat, StatusBadge, TableFoot, TextArea, Toolbar } from '../components/ui'
import { Modal } from '../components/Modal'
import { date, money } from '../lib/format'

export default function Vehicles() {
  const { data, commit, nextId, notify } = useApp()
  const [search, setSearch] = useState('')
  const [adding, setAdding] = useState(false)
  const household = (id) => data.households.find((h) => h.id === id)
  const term = search.trim().toLowerCase()
  const rows = data.vehicles.filter((v) =>
    !term || [v.licensePlate, v.brand, household(v.householdId)?.ownerName].some((x) => String(x || '').toLowerCase().includes(term)))

  const save = (form) => {
    const plate = String(form.licensePlate || '').trim()
    if (data.vehicles.some((v) => v.licensePlate === plate)) { notify('Biển số đã tồn tại', 'err'); return false }
    commit('vehicles', {
      type: 'create',
      entity: {
        id: nextId(data.vehicles), householdId: Number(form.householdId), vehicleType: form.vehicleType,
        licensePlate: plate, brand: String(form.brand || '').trim(), monthlyFee: Number(form.monthlyFee || 0),
        registeredDate: form.registeredDate, status: form.status, note: String(form.note || '').trim()
      }
    })
    notify('Đã thêm phương tiện')
  }

  return (
    <>
      <PageHead title="Phí gửi xe" sub="Quản lý phương tiện đăng ký và phí gửi xe hằng tháng">
        <button className="btn btn-primary" onClick={() => setAdding(true)}><Icon name="plus" size={16} />Thêm phương tiện</button>
      </PageHead>
      <div className="grid grid-3" style={{ marginBottom: 18 }}>
        <Stat icon="car" tone="blue" label="Xe máy" value={data.vehicles.filter((v) => v.vehicleType === 'MOTORBIKE').length} note="70.000₫ / xe / tháng" />
        <Stat icon="car" tone="gold" label="Ô tô" value={data.vehicles.filter((v) => v.vehicleType === 'CAR').length} note="1.200.000₫ / xe / tháng" />
        <Stat icon="wallet" tone="green" label="Phí/tháng" value={money(data.vehicles.reduce((s, v) => s + Number(v.monthlyFee || 0), 0))} />
      </div>
      <section className="card">
        <Toolbar value={search} onChange={setSearch} placeholder="Tìm biển số, hiệu xe, chủ hộ…" />
        <div className="table-wrap">
          <table className="data">
            <thead><tr><th>Biển số</th><th>Loại xe</th><th>Chủ hộ</th><th>Hiệu xe</th><th className="num">Phí/tháng</th><th>Ngày đăng ký</th><th>Trạng thái</th></tr></thead>
            <tbody>
              {rows.length ? rows.map((v) => (
                <tr key={v.id}>
                  <td className="cell-main">{v.licensePlate}</td>
                  <td>{v.vehicleType === 'CAR' ? 'Ô tô' : 'Xe máy'}</td>
                  <td>{household(v.householdId)?.ownerName || '—'}</td>
                  <td>{v.brand || '—'}</td>
                  <td className="num">{money(v.monthlyFee)}</td>
                  <td>{date(v.registeredDate)}</td>
                  <td><StatusBadge value={v.status} /></td>
                </tr>
              )) : <tr><td colSpan={7}><Empty title="Không tìm thấy phương tiện" hint="Thử thay đổi từ khóa tìm kiếm." /></td></tr>}
            </tbody>
          </table>
        </div>
        <TableFoot shown={rows.length} total={data.vehicles.length} />
      </section>

      {adding && (
        <Modal title="Thêm phương tiện gửi xe" onClose={() => setAdding(false)} onConfirm={save}>
          <FormGrid>
            <SelectField label="Hộ gia đình" name="householdId"
              options={data.households.map((h) => [h.id, `${h.householdCode}, ${h.apartmentNumber}, ${h.ownerName}`])} />
            <SelectField label="Loại xe" name="vehicleType" options={[['MOTORBIKE', 'Xe máy'], ['CAR', 'Ô tô']]} />
            <Field label="Biển số" name="licensePlate" required />
            <Field label="Hiệu xe" name="brand" />
            <Field label="Phí/tháng (đ)" name="monthlyFee" type="number" step="1000" value={70000} />
            <Field label="Ngày đăng ký" name="registeredDate" type="date" value={new Date().toISOString().slice(0, 10)} />
            <SelectField label="Trạng thái" name="status" options={[['ACTIVE', 'Đang hoạt động'], ['INACTIVE', 'Ngừng hoạt động']]} />
            <TextArea label="Ghi chú" name="note" />
          </FormGrid>
        </Modal>
      )}
    </>
  )
}
