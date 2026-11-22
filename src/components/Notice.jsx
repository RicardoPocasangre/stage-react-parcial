// Aviso en línea. Los errores usan role="alert"; el resto, role="status".
export default function Notice({ tone = 'info', children, onClose }) {
  return (
    <div className={`notice notice--${tone}`} role={tone === 'danger' ? 'alert' : 'status'}>
      <p className="notice__text">{children}</p>
      {onClose && (
        <button type="button" className="notice__close" onClick={onClose} aria-label="Cerrar aviso">
          ×
        </button>
      )}
    </div>
  )
}
