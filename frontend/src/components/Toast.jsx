import { Icon } from './Icons'

export function ToastHost({ toasts }) {
  return (
    <div className="toast-stack" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className={`toast ${t.tone || 'ok'}`}>
          <Icon name={t.tone === 'err' || t.tone === 'warn' ? 'alert' : 'checkCircle'} size={18} />
          <span>{t.message}</span>
        </div>
      ))}
    </div>
  )
}
