// Estado de carga para operaciones simuladas.
export default function LoadingState({ label = 'Cargando…' }) {
  return (
    <div className="state" role="status" aria-live="polite">
      <span className="state__spinner" aria-hidden="true" />
      <p className="state__text">{label}</p>
    </div>
  )
}
