import { useEffect } from 'react'
import { Icon } from './Icons'

export function Modal({ title, confirmText = 'Lưu thay đổi', wide, onClose, onConfirm, children }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  const submit = (e) => {
    e.preventDefault()
    const data = Object.fromEntries(new FormData(e.currentTarget))
    const result = onConfirm ? onConfirm(data) : true
    if (result !== false) onClose()
  }

  return (
    <div className="overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className="modal" role="dialog" aria-modal="true" aria-label={title}
        style={{ width: `min(${wide ? 720 : 560}px, 100%)` }}>
        <div className="modal-head">
          <h3>{title}</h3>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Đóng"><Icon name="close" size={18} /></button>
        </div>
        <form onSubmit={submit}>
          <div className="modal-body">{children}</div>
          <div className="modal-foot">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Hủy</button>
            <button type="submit" className="btn btn-primary">{confirmText}</button>
          </div>
        </form>
      </div>
    </div>
  )
}
