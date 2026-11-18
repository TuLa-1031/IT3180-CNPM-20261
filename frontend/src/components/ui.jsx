// Small shared building blocks: page head, stats, badges, fields, charts.
import { Icon } from './Icons'
export { Icon } from './Icons'

export function PageHead({ title, sub, children }) {
  return (
    <div className="page-head">
      <div>
        <h1 className="page-title">{title}</h1>
        <p className="page-sub">{sub}</p>
      </div>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>{children}</div>
    </div>
  )
}

export function Stat({ icon, tone = 'blue', label, value, note, noteTone }) {
  return (
    <div className="stat">
      <div className={`stat-icon ${tone}`}><Icon name={icon} size={19} /></div>
      <div>
        <div className="stat-label">{label}</div>
        <div className={`stat-value tabular`} style={value.length > 12 ? { fontSize: 17 } : undefined}>{value}</div>
        {note && <div className={`stat-note ${noteTone || ''}`}>{note}</div>}
      </div>
    </div>
  )
}

export function Badge({ text, tone = 'gray' }) {
  return <span className={`badge ${tone}`}>{text}</span>
}

export function StatusBadge({ value }) {
  const labels = {
    ACTIVE: 'Đang hoạt động', INACTIVE: 'Ngừng hoạt động', MOVED_OUT: 'Đã chuyển đi',
    UNPAID: 'Chưa nộp', PARTIAL: 'Nộp một phần', PAID: 'Đã nộp', OPEN: 'Đang thu', CLOSED: 'Đã kết thúc',
    PERMANENT: 'Thường trú', TEMPORARY_RESIDENCE: 'Tạm trú', TEMPORARY_ABSENCE: 'Tạm vắng',
    MOVE_IN: 'Chuyển đến', MOVE_OUT: 'Chuyển đi', ADMIN: 'Quản trị viên', MANAGER: 'Ban quản trị',
    ACCOUNTANT: 'Kế toán'
  }
  const tones = {
    ACTIVE: 'green', PAID: 'green', OPEN: 'blue', PERMANENT: 'green', MOVE_IN: 'green', ADMIN: 'blue', MANAGER: 'blue',
    PARTIAL: 'gold', TEMPORARY_ABSENCE: 'gold', ACCOUNTANT: 'gold',
    UNPAID: 'red', INACTIVE: 'gray', MOVED_OUT: 'gray', CLOSED: 'gray', MOVE_OUT: 'gray',
    TEMPORARY_RESIDENCE: 'blue'
  }
  return <Badge text={labels[value] || value || '—'} tone={tones[value] || 'gray'} />
}

export function Empty({ title, hint }) {
  return (
    <div className="empty">
      <Icon name="moon" size={40} />
      <p>{title}</p>
      {hint && <div className="hint">{hint}</div>}
    </div>
  )
}

export function Donut({ segments, top, bottom }) {
  if (!segments.length) return null
  let acc = 0
  const stops = segments.map((s) => {
    const from = acc
    acc += s.value
    return `${s.color} ${from}deg ${acc}deg`
  }).join(', ')
  return (
    <div className="donut" style={{ background: `conic-gradient(${stops})` }}>
      <div className="donut-center">
        <div className="donut-num">{top}</div>
        <div className="donut-cap">{bottom}</div>
      </div>
    </div>
  )
}

export function Toolbar({ value, onChange, placeholder, filter }) {
  return (
    <div className="table-toolbar">
      <label className="toolbar-search">
        <Icon name="search" size={15} />
        <input type="search" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} aria-label="Tìm kiếm" />
      </label>
      {filter}
    </div>
  )
}

export function FilterSelect({ value, onChange, options, label }) {
  return (
    <select className="filter-select" value={value} onChange={(e) => onChange(e.target.value)} aria-label={label}>
      {options.map(([v, text]) => <option key={v} value={v}>{text}</option>)}
    </select>
  )
}

export function TableFoot({ shown, total }) {
  return (
    <div className="table-foot">
      <span>Hiển thị {shown} / {total} bản ghi</span>
      <span>Tìm kiếm và lọc theo cột</span>
    </div>
  )
}

export function FormGrid({ children }) {
  return <div className="form-grid">{children}</div>
}

export function Field({ label, name, value = '', type = 'text', required, min, max, step, placeholder, full, onChange, disabled }) {
  const id = `f-${name || label}`
  const binding = onChange ? { value: value ?? '', onChange } : { defaultValue: value ?? '' }
  return (
    <div className={`field ${full ? 'full' : ''}`}>
      <label htmlFor={id}>{label}</label>
      <input id={id} name={name} type={type} required={required}
        min={min} max={max} step={step} placeholder={placeholder} disabled={disabled}
        {...binding} />
    </div>
  )
}

export function SelectField({ label, name, value, options, full }) {
  const id = `f-${name}`
  return (
    <div className={`field ${full ? 'full' : ''}`}>
      <label htmlFor={id}>{label}</label>
      <select id={id} name={name} defaultValue={value}>
        {options.map(([v, text]) => <option key={v} value={v}>{text}</option>)}
      </select>
    </div>
  )
}

export function TextArea({ label, name, value = '', full = true }) {
  const id = `f-${name}`
  return (
    <div className={`field ${full ? 'full' : ''}`}>
      <label htmlFor={id}>{label}</label>
      <textarea id={id} name={name} defaultValue={value} />
    </div>
  )
}

export function CheckboxField({ label, name, checked }) {
  return (
    <div className="field full">
      <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <input type="checkbox" name={name} defaultChecked={checked} style={{ width: 'auto' }} />
        {label}
      </label>
    </div>
  )
}

export function KV({ pairs }) {
  return (
    <dl className="kv">
      {pairs.map(([k, v]) => <div key={k} style={{ display: 'contents' }}><dt>{k}</dt><dd>{v}</dd></div>)}
    </dl>
  )
}
