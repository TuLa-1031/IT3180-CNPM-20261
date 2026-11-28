import { useEffect, useState } from 'react'
import { useApp } from '../App'
import { Icon } from '../components/Icons'
import { Modal } from '../components/Modal'
import { Empty, Field, FilterSelect, FormGrid, KV, PageHead, SelectField, StatusBadge, TableFoot, Toolbar } from '../components/ui'
import { householdsApi, residentsApi } from '../features/households/api'
import { HOUSEHOLD_STATUS_OPTIONS } from '../features/households/constants'
import { date } from '../lib/format'

export default function Households() {
  const { data, commit, nextId, notify, globalSearch, setGlobalSearch } = useApp()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [rows, setRows] = useState([])
  const [residents, setResidents] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [retry, setRetry] = useState(0)
  const [modal, setModal] = useState(null)

  useEffect(() => {
    if (globalSearch) { setSearch(globalSearch); setGlobalSearch('') }
  }, [globalSearch, setGlobalSearch])

  useEffect(() => {
    let active = true
    setLoading(true)
    setError('')
    Promise.all([
      householdsApi.list({ q: search.trim(), status }),
      householdsApi.list({}),
      residentsApi.list({})
    ])
      .then(([households, allHouseholds, residentRows]) => {
        if (active) {
          setRows(households)
          setTotal(allHouseholds.length)
          setResidents(residentRows)
        }
      })
      .catch((requestError) => {
        if (active) {
          setRows([])
          setTotal(0)
          setResidents([])
          setError(requestError.message || 'Không tải được dữ liệu hộ gia đình')
        }
      })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [search, status, retry])

  const current = modal && modal.id ? data.households.find((h) => h.id === modal.id) : null
  const selected = modal?.id ? rows.find((h) => h.id === modal.id) : null
  const close = () => setModal(null)

  const save = (form) => {
    const obj = {
      householdCode: String(form.householdCode || '').trim(),
      apartmentNumber: String(form.apartmentNumber || '').trim(),
      floor: Number(form.floor), area: Number(form.area),
      ownerName: String(form.ownerName || '').trim(),
      phone: String(form.phone || '').trim(), moveInDate: form.moveInDate,
      status: form.status
    }
    if (data.households.some((h) => h.householdCode === obj.householdCode && (!current || h.id !== current.id))) {
      notify('Mã hộ đã tồn tại', 'err'); return false
    }
    if (current) commit('households', { type: 'update', id: current.id, patch: obj })
    else commit('households', { type: 'create', entity: { id: nextId(data.households), ...obj } })
    notify(current ? 'Đã cập nhật hộ gia đình' : 'Đã thêm hộ gia đình')
  }

  return (
    <>
      <PageHead title="Hộ gia đình" sub="Danh sách hộ khẩu và căn hộ đang quản lý">
        <button className="btn btn-primary" onClick={() => setModal({ type: 'edit' })}><Icon name="plus" size={16} />Thêm hộ gia đình</button>
      </PageHead>
      <section className="card">
        <Toolbar value={search} onChange={setSearch} placeholder="Tìm chủ hộ, mã hộ, căn hộ…"
          filter={<FilterSelect label="Lọc trạng thái" value={status} onChange={setStatus}
            options={HOUSEHOLD_STATUS_OPTIONS} />} />
        <div className="table-wrap">
          <table className="data">
            <thead><tr>
              <th>Hộ gia đình</th><th>Căn hộ</th><th>Tầng</th><th className="num">Diện tích</th>
              <th>Chủ hộ</th><th>Điện thoại</th><th className="num">Nhân khẩu</th><th>Trạng thái</th><th className="num">Thao tác</th>
            </tr></thead>
            <tbody>
              {loading ? <tr><td colSpan={9} role="status">Đang tải dữ liệu hộ gia đình…</td></tr>
                : error ? <tr><td colSpan={9} role="alert">{error} <button className="mini-btn" onClick={() => setRetry((value) => value + 1)}>Thử lại</button></td></tr>
                  : rows.length ? rows.map((h) => (
                <tr key={h.id}>
                  <td><span className="code">{h.householdCode}</span></td>
                  <td className="cell-main">{h.apartmentNumber}</td>
                  <td>{h.floor}</td>
                  <td className="num">{h.area} m²</td>
                  <td className="cell-main">{h.ownerName}<div className="cell-sub">{date(h.moveInDate)}, vào ở</div></td>
                  <td>{h.phone}</td>
                  <td className="num">{residents.filter((r) => r.householdId === h.id).length}</td>
                  <td><StatusBadge value={h.status} /></td>
                  <td><div className="row-actions">
                    <button className="mini-btn" onClick={() => setModal({ type: 'view', id: h.id })}>Xem</button>
                    <button className="mini-btn" onClick={() => setModal({ type: 'edit', id: h.id })}>Sửa</button>
                  </div></td>
                </tr>
              )) : <tr><td colSpan={9}><Empty title="Không tìm thấy hộ gia đình" hint="Thử thay đổi từ khóa hoặc bộ lọc." /></td></tr>}
            </tbody>
          </table>
        </div>
        <TableFoot shown={rows.length} total={total} />
      </section>

      {modal?.type === 'edit' && (
        <Modal title={current ? 'Sửa thông tin hộ gia đình' : 'Thêm hộ gia đình'} onClose={close} onConfirm={save}>
          <FormGrid>
            <Field label="Mã hộ" name="householdCode" value={current?.householdCode} placeholder="BM-2901" required />
            <Field label="Số căn hộ" name="apartmentNumber" value={current?.apartmentNumber} required />
            <Field label="Tầng" name="floor" type="number" value={current?.floor} min={1} max={30} required />
            <Field label="Diện tích (m²)" name="area" type="number" step="0.01" value={current?.area} required />
            <Field label="Chủ hộ" name="ownerName" value={current?.ownerName} required />
            <Field label="Điện thoại" name="phone" value={current?.phone} />
            <Field label="Ngày vào ở" name="moveInDate" type="date" value={current?.moveInDate} />
            <SelectField label="Trạng thái" name="status" value={current?.status || 'ACTIVE'}
              options={[['ACTIVE', 'Đang hoạt động'], ['MOVED_OUT', 'Đã chuyển đi']]} />
          </FormGrid>
        </Modal>
      )}

      {modal?.type === 'view' && selected && (
        <Modal title="Chi tiết hộ gia đình" confirmText="Đóng" onClose={close}>
          <KV pairs={[
            ['Mã hộ', <span className="code">{selected.householdCode}</span>],
            ['Căn hộ', `${selected.apartmentNumber}, Tầng ${selected.floor}`],
            ['Diện tích', `${selected.area} m²`],
            ['Chủ hộ', selected.ownerName],
            ['Điện thoại', selected.phone || '—'],
            ['Ngày vào ở', date(selected.moveInDate)],
            ['Trạng thái', <StatusBadge value={selected.status} />]
          ]} />
          <h4 style={{ fontSize: 13, margin: '20px 0 6px' }}>Nhân khẩu trong hộ</h4>
          {residents.filter((r) => r.householdId === selected.id).map((r) => (
            <div className="list-row" key={r.id}>
              <span className="dot" style={{ background: 'var(--moon)' }} />
              <div><div className="lr-main">{r.fullName}</div><div className="lr-sub">{r.relationshipToOwner}</div></div>
              <div className="lr-val" style={{ fontSize: 12, fontWeight: 500 }}><StatusBadge value={r.residenceStatus} /></div>
            </div>
          ))}
        </Modal>
      )}
    </>
  )
}
