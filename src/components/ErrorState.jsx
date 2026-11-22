import Button from './Button.jsx'

// Estado de error con mensaje comprensible y opción de reintentar.
export default function ErrorState({ message, onRetry }) {
  return (
    <div className="state state--error" role="alert">
      <h2 className="state__title">Algo salió mal</h2>
      <p className="state__text">{message}</p>
      {onRetry && (
        <Button variant="secondary" onClick={onRetry}>
          Reintentar
        </Button>
      )}
    </div>
  )
}
