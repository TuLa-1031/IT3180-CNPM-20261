import { useCallback, useEffect, useState } from 'react'
import { Empty, FilterSelect, PageHead, StatusBadge, TableFoot, Toolbar } from '../../../components/ui'
import { date } from '../../../lib/format'
import { equipmentApi } from '../api'

const STATUS_OPTIONS = [
  ['', 'Tất cả trạng thái'],
  ['ACTIVE', 'Đang hoạt động'],
  ['MAINTENANCE', 'Đang bảo trì'],
  ['BROKEN', 'Hỏng']
]

export default function EquipmentList() {
  const [rows, setRows] = useState([])
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const loadEquipment = useCallback(async (signal) => {
    setLoading(true)
    setError(null)
    try {
      const items = await equipmentApi.list({ status, q: search.trim() })
      if (!signal?.aborted) setRows(items)
    } catch (err) {
      if (!signal?.aborted) setError(err.message || 'Không tải được danh sách thiết bị')
    } finally {
      if (!signal?.aborted) setLoading(false)
    }
  }, [status, search])

  useEffect(() => {
    const controller = { aborted: false }
    loadEquipment(controller)
    return () => { controller.aborted = true }
  }, [loadEquipment])

  return (
    <>
      <PageHead
        title="Thiết bị"
        sub="Danh mục thiết bị cần bảo trì trong chung cư"
      />

      <section className="card">
        <Toolbar
          value={search}
          onChange={setSearch}
          placeholder="Tìm theo tên hoặc vị trí thiết bị…"
          filter={(
            <FilterSelect
              label="Lọc trạng thái"
              value={status}
              onChange={setStatus}
              options={STATUS_OPTIONS}
            />
          )}
        />

        {error && (
          <div className="empty">
            <p>{error}</p>
            <div className="hint" style={{ marginBottom: 12 }}>Kiểm tra kết nối máy chủ rồi thử lại.</div>
            <button className="btn btn-primary" onClick={() => loadEquipment()}>Thử lại</button>
          </div>
        )}

        {!error && loading && (
          <div className="loading">Đang tải danh sách thiết bị…</div>
        )}

        {!error && !loading && (
          <>
            <div className="table-wrap">
              <table className="data">
                <thead>
                  <tr>
                    <th>Mã</th>
                    <th>Tên</th>
                    <th>Vị trí</th>
                    <th>Trạng thái</th>
                    <th>Ngày lắp</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.length ? rows.map((item) => (
                    <tr key={item.id}>
                      <td><span className="code">TB-{item.id}</span></td>
                      <td className="cell-main">
                        {item.name}
                        {item.note && <div className="cell-sub">{item.note}</div>}
                      </td>
                      <td>{item.location || '—'}</td>
                      <td><StatusBadge value={item.status} /></td>
                      <td>{date(item.installedAt)}</td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={5}>
                        <Empty
                          title="Chưa có thiết bị"
                          hint="Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc trạng thái."
                        />
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <TableFoot shown={rows.length} total={rows.length} />
          </>
        )}
      </section>
    </>
  )
}
