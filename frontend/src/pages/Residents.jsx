import { useEffect, useState } from 'react'
import { useApp } from '../App'
import { Icon } from '../components/Icons'
import { Modal } from '../components/Modal'
import { Empty, Field, FilterSelect, FormGrid, KV, PageHead, SelectField, StatusBadge, TableFoot, TextArea, Toolbar } from '../components/ui'
import { householdsApi, residentsApi } from '../features/households/api'
import { RESIDENT_STATUS_OPTIONS } from '../features/households/constants'
import { date } from '../lib/format'

export default function Residents() {
  const { data, commit, nextId, notify } = useApp()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [rows, setRows] = useState([])
  const [households, setHouseholds] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [retry, setRetry] = useState(0)
  const [modal, setModal] = useState(null)
  const household = (id) => households.find((h) => h.id === id)

  useEffect(() => {
    let active = true
    setLoading(true)
    setError('')
    Promise.all([
      residentsApi.list({ q: search.trim(), status }),
      residentsApi.list({}),
      householdsApi.list({})
    ])
      .then(([residentRows, allResidents, householdRows]) => {
        if (active) {
          setRows(residentRows)
          setTotal(allResidents.length)
          setHouseholds(householdRows)
        }
      })
      .catch((requestError) => {
        if (active) {
          setRows([])
          setTotal(0)
          setHouseholds([])
          setError(requestError.message || 'Không tải được dữ liệu nhân khẩu')
        }
      })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [search, status, retry])

  const current = modal?.id ? data.residents.find((r) => r.id === modal.id) : null
  const selected = modal?.id ? rows.find((r) => r.id === modal.id) : null
  const close = () => setModal(null)

  const save = (form) => {
    const obj = {
      householdId: Number(form.householdId), fullName: String(form.fullName || '').trim(),
      relationshipToOwner: String(form.relationshipToOwner || '').trim(),
      dateOfBirth: form.dateOfBirth, gender: form.gender,
      identityCard: String(form.identityCard || '').trim(), occupation: String(form.occupation || '').trim(),
      hometown: String(form.hometown || '').trim(), residenceStatus: form.residenceStatus,
      note: String(form.note || '').trim()
    }
    if (current) commit('residents', { type: 'update', id: current.id, patch: obj })
    else commit('residents', { type: 'create', entity: { id: nextId(data.residents), ...obj } })
    notify(current ? 'Đã cập nhật nhân khẩu' : 'Đã thêm nhân khẩu')
  }

  const householdOptions = households.map((h) => [h.id, `${h.householdCode}, ${h.apartmentNumber}, ${h.ownerName}`])

  return (
    <>
      <PageHead title="Nhân khẩu" sub="Danh sách cư dân đang sinh sống tại BlueMoon">
        <button className="btn btn-primary" onClick={() => setModal({ type: 'edit' })}><Icon name="plus" size={16} />Thêm nhân khẩu</button>
      </PageHead>
      <section className="card">
        <Toolbar value={search} onChange={setSearch} placeholder="Tìm họ tên, CCCD, căn hộ…"
          filter={<FilterSelect label="Lọc trạng thái" value={status} onChange={setStatus}
            options={RESIDENT_STATUS_OPTIONS} />} />
        <div className="table-wrap">
          <table className="data">
            <thead><tr>
              <th>Họ và tên</th><th>Căn hộ</th><th>Quan hệ với chủ hộ</th><th>Ngày sinh</th>
              <th>CCCD/CMND</th><th>Trạng thái cư trú</th><th className="num">Thao tác</th>
            </tr></thead>
            <tbody>
              {loading ? <tr><td colSpan={7} role="status">Đang tải dữ liệu nhân khẩu…</td></tr>
                : error ? <tr><td colSpan={7} role="alert">{error} <button className="mini-btn" onClick={() => setRetry((value) => value + 1)}>Thử lại</button></td></tr>
                  : rows.length ? rows.map((r) => (
                <tr key={r.id}>
                  <td className="cell-main">{r.fullName}<div className="cell-sub">{r.occupation || '—'}</div></td>
                  <td>{household(r.householdId)?.apartmentNumber || '—'}</td>
                  <td>{r.relationshipToOwner}</td>
                  <td>{date(r.dateOfBirth)}</td>
                  <td>{r.identityCard || '—'}</td>
                  <td><StatusBadge value={r.residenceStatus} /></td>
                  <td><div className="row-actions">
                    <button className="mini-btn" onClick={() => setModal({ type: 'view', id: r.id })}>Xem</button>
                    <button className="mini-btn" onClick={() => setModal({ type: 'edit', id: r.id })}>Sửa</button>
                  </div></td>
                </tr>
              )) : <tr><td colSpan={7}><Empty title="Không tìm thấy nhân khẩu" hint="Thử thay đổi từ khóa hoặc bộ lọc." /></td></tr>}
            </tbody>
          </table>
        </div>
        <TableFoot shown={rows.length} total={total} />
      </section>

      {modal?.type === 'edit' && (
        <Modal title={current ? 'Sửa thông tin nhân khẩu' : 'Thêm nhân khẩu'} wide onClose={close} onConfirm={save}>
          <FormGrid>
            <SelectField label="Hộ gia đình" name="householdId" value={current?.householdId} options={householdOptions} />
            <Field label="Họ và tên" name="fullName" value={current?.fullName} required />
            <Field label="Quan hệ với chủ hộ" name="relationshipToOwner" value={current?.relationshipToOwner} placeholder="Chủ hộ, Vợ, Con…" required />
            <Field label="Ngày sinh" name="dateOfBirth" type="date" value={current?.dateOfBirth} />
            <SelectField label="Giới tính" name="gender" value={current?.gender || 'OTHER'}
              options={[['MALE', 'Nam'], ['FEMALE', 'Nữ'], ['OTHER', 'Khác']]} />
            <Field label="CCCD/CMND" name="identityCard" value={current?.identityCard} />
            <Field label="Nghề nghiệp" name="occupation" value={current?.occupation} />
            <Field label="Quê quán" name="hometown" value={current?.hometown} />
            <SelectField label="Trạng thái cư trú" name="residenceStatus" value={current?.residenceStatus || 'PERMANENT'}
              options={[['PERMANENT', 'Thường trú'], ['TEMPORARY_RESIDENCE', 'Tạm trú'], ['TEMPORARY_ABSENCE', 'Tạm vắng'], ['MOVED_OUT', 'Đã chuyển đi']]} />
            <TextArea label="Ghi chú" name="note" value={current?.note} />
          </FormGrid>
        </Modal>
      )}

      {modal?.type === 'view' && selected && (
        <Modal title="Chi tiết nhân khẩu" confirmText="Đóng" onClose={close}>
          <KV pairs={[
            ['Họ và tên', selected.fullName],
            ['Căn hộ', household(selected.householdId)?.householdCode || '—'],
            ['Quan hệ', selected.relationshipToOwner],
            ['Ngày sinh', date(selected.dateOfBirth)],
            ['Giới tính', selected.gender === 'MALE' ? 'Nam' : selected.gender === 'FEMALE' ? 'Nữ' : 'Khác'],
            ['CCCD/CMND', selected.identityCard || '—'],
            ['Nghề nghiệp', selected.occupation || '—'],
            ['Quê quán', selected.hometown || '—'],
            ['Trạng thái', <StatusBadge value={selected.residenceStatus} />],
            ['Ghi chú', selected.note || '—']
          ]} />
        </Modal>
      )}
    </>
  )
}
