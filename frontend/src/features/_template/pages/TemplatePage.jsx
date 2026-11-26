import { useEffect, useState } from 'react'
import { useApp } from '../../../App'
import { Icon } from '../../../components/Icons'
import { Modal } from '../../../components/Modal'
import { Empty, Field, FormGrid, PageHead, TableFoot, Toolbar } from '../../../components/ui'

const SAMPLE_ROWS = [
  { id: 1, name: 'Bản ghi mẫu 01', note: 'Sao chép thư mục này để bắt đầu một phân hệ mới.' },
  { id: 2, name: 'Bản ghi mẫu 02', note: 'Thay dữ liệu mẫu bằng dữ liệu từ features/<domain>/api.js.' },
  { id: 3, name: 'Bản ghi mẫu 03', note: 'Giữ nguyên PageHead, Toolbar, Modal và cách hiển thị trạng thái.' }
]

/**
 * Trang mẫu cho phân hệ mới: bảng + ô tìm kiếm + nút Thêm + modal 2 ô.
 * Khi dùng thật, thay rows bằng dữ liệu API (xem api.js trong cùng thư mục).
 */
export default function TemplatePage({
  title = 'Trang mẫu',
  sub = 'Khung màn hình chuẩn cho một phân hệ: bảng, tìm kiếm, thêm mới bằng modal.',
  initialRows = SAMPLE_ROWS,
  addLabel = 'Thêm bản ghi',
  readOnly = false,
  emptyTitle = 'Chưa có bản ghi',
  emptyHint = 'Bấm nút Thêm để tạo bản ghi đầu tiên.'
}) {
  const { notify } = useApp()
  const [rows, setRows] = useState(() => initialRows)
  const [search, setSearch] = useState('')
  const [open, setOpen] = useState(false)

  useEffect(() => {
    setRows(initialRows)
    setSearch('')
    setOpen(false)
    // initialRows được truyền cố định cho mỗi màn hình; đổi tiêu đề = đổi màn hình.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title])

  const term = search.trim().toLowerCase()
  const filtered = rows.filter((row) =>
    !term || [row.name, row.note].some((value) => String(value || '').toLowerCase().includes(term))
  )

  const nextId = () => rows.reduce((max, row) => Math.max(max, Number(row.id) || 0), 0) + 1

  const add = (form) => {
    const name = String(form.name || '').trim()
    if (!name) {
      notify('Nhập tên bản ghi', 'err')
      return false
    }
    setRows((prev) => [...prev, { id: nextId(), name, note: String(form.note || '').trim() }])
    notify('Đã thêm bản ghi')
    return true
  }

  const remove = (row) => {
    setRows((prev) => prev.filter((item) => item.id !== row.id))
    notify('Đã xóa bản ghi', 'info')
  }

  return (
    <>
      <PageHead title={title} sub={sub}>
        {!readOnly && (
          <button className="btn btn-primary" onClick={() => setOpen(true)}>
            <Icon name="plus" size={16} />{addLabel}
          </button>
        )}
      </PageHead>

      <section className="card">
        <Toolbar value={search} onChange={setSearch} placeholder="Tìm theo tên hoặc ghi chú…" />
        <div className="table-wrap">
          <table className="data">
            <thead>
              <tr><th>Tên</th><th>Ghi chú</th>{!readOnly && <th className="num">Thao tác</th>}</tr>
            </thead>
            <tbody>
              {filtered.length ? filtered.map((row) => (
                <tr key={row.id}>
                  <td className="cell-main">{row.name}</td>
                  <td>{row.note || '—'}</td>
                  {!readOnly && (
                    <td>
                      <div className="row-actions">
                        <button className="mini-btn" onClick={() => remove(row)}>Xóa</button>
                      </div>
                    </td>
                  )}
                </tr>
              )) : (
                <tr>
                  <td colSpan={readOnly ? 2 : 3}>
                    <Empty title={emptyTitle} hint={emptyHint} />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <TableFoot shown={filtered.length} total={rows.length} />
      </section>

      {!readOnly && open && (
        <Modal title={addLabel} confirmText="Thêm" onClose={() => setOpen(false)} onConfirm={add}>
          <FormGrid>
            <Field label="Tên" name="name" placeholder="Nhập tên bản ghi" required />
            <Field label="Ghi chú" name="note" placeholder="Mô tả ngắn (không bắt buộc)" />
          </FormGrid>
        </Modal>
      )}
    </>
  )
}
