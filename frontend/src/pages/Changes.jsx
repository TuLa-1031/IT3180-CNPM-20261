import { useEffect, useState } from 'react'
import { useApp } from '../App'
import { Badge, Empty, Field, FilterSelect, FormGrid, Icon, PageHead, SelectField, TableFoot, TextArea, Toolbar } from '../components/ui'
import { Modal } from '../components/Modal'
import { residenceChangesApi } from '../features/households/api'
import { RESIDENCE_CHANGE_TYPE_OPTIONS } from '../features/households/constants'
import { CHANGE_TYPE, date } from '../lib/format'

export default function Changes() {
  const { data, user, commit, nextId, notify } = useApp()
  const [search, setSearch] = useState('')
  const [type, setType] = useState('')
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [retry, setRetry] = useState(0)
  const [adding, setAdding] = useState(false)
  const resident = (id) => data.residents.find((r) => r.id === id)
  const household = (id) => data.households.find((h) => h.id === id)

  useEffect(() => {
    let active = true
    setLoading(true)
    setError('')
    residenceChangesApi.list({ changeType: type })
      .then((result) => { if (active) setRows(result) })
      .catch((requestError) => {
        if (active) {
          setRows([])
          setError(requestError.message || 'Không tải được dữ liệu biến động')
        }
      })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [type, retry])

  const term = search.trim().toLowerCase()
  const visibleRows = rows.filter((c) => {
    const r = resident(c.residentId), h = household(c.householdId)
    return (!type || c.changeType === type) &&
      (!term || [r?.fullName, r?.identityCard, h?.householdCode, h?.apartmentNumber, c.destinationOrOrigin]
        .some((v) => String(v || '').toLowerCase().includes(term)))
  }).sort((a, b) => String(b.startDate).localeCompare(String(a.startDate)))

  const save = (form) => {
    const r = resident(Number(form.residentId))
    if (!r) { notify('Chọn cư dân cần ghi nhận', 'err'); return false }
    commit('residenceChanges', {
      type: 'create',
      entity: {
        id: nextId(data.residenceChanges), residentId: r.id, householdId: r.householdId,
        changeType: form.changeType, startDate: form.startDate,
        endDate: form.endDate || null,
        destinationOrOrigin: String(form.destinationOrOrigin || '').trim(),
        reason: String(form.reason || '').trim(), createdBy: user.id
      }
    })
    notify('Đã ghi nhận biến đổi')
  }

  return (
    <>
      <PageHead title="Biến đổi nhân khẩu" sub="Theo dõi tạm trú, tạm vắng và biến động cư dân">
        <button className="btn btn-primary" onClick={() => setAdding(true)}><Icon name="plus" size={16} />Ghi nhận biến đổi</button>
      </PageHead>
      <section className="card">
        <Toolbar value={search} onChange={setSearch} placeholder="Tìm cư dân, mã hộ, CCCD, địa chỉ…"
          filter={<FilterSelect label="Lọc loại biến đổi" value={type} onChange={setType}
            options={RESIDENCE_CHANGE_TYPE_OPTIONS} />} />
        <div className="table-wrap">
          <table className="data">
            <thead><tr><th>Cư dân</th><th>Căn hộ</th><th>Loại biến đổi</th><th>Từ ngày</th><th>Đến ngày</th><th>Địa chỉ liên quan</th><th>Lý do</th></tr></thead>
            <tbody>
              {loading ? <tr><td colSpan={7} role="status">Đang tải dữ liệu biến động…</td></tr>
                : error ? <tr><td colSpan={7} role="alert">{error} <button className="mini-btn" onClick={() => setRetry((value) => value + 1)}>Thử lại</button></td></tr>
                  : visibleRows.length ? visibleRows.map((c) => {
                const meta = CHANGE_TYPE[c.changeType] || [c.changeType, 'gray']
                return (
                  <tr key={c.id}>
                    <td className="cell-main">{resident(c.residentId)?.fullName || '—'}</td>
                    <td>{household(c.householdId)?.apartmentNumber || '—'}</td>
                    <td><Badge text={meta[0]} tone={meta[1]} /></td>
                    <td>{date(c.startDate)}</td><td>{date(c.endDate)}</td>
                    <td>{c.destinationOrOrigin || '—'}</td>
                    <td className="muted">{c.reason || '—'}</td>
                  </tr>
                )
              }) : <tr><td colSpan={7}><Empty title="Chưa có biến động nào" hint="Thử thay đổi từ khóa hoặc bộ lọc." /></td></tr>}
            </tbody>
          </table>
        </div>
        <TableFoot shown={visibleRows.length} total={data.residenceChanges.length} />
      </section>

      {adding && (
        <Modal title="Ghi nhận biến đổi nhân khẩu" wide onClose={() => setAdding(false)} onConfirm={save}>
          <FormGrid>
            <SelectField label="Cư dân" name="residentId"
              options={data.residents.map((r) => [r.id, `${r.fullName}, ${household(r.householdId)?.apartmentNumber || ''}`])} />
            <SelectField label="Loại biến đổi" name="changeType"
              options={RESIDENCE_CHANGE_TYPE_OPTIONS.filter(([value]) => value)} />
            <Field label="Từ ngày" name="startDate" type="date" value={new Date().toISOString().slice(0, 10)} required />
            <Field label="Đến ngày" name="endDate" type="date" />
            <Field label="Địa chỉ liên quan" name="destinationOrOrigin" />
            <TextArea label="Lý do" name="reason" />
          </FormGrid>
        </Modal>
      )}
    </>
  )
}
