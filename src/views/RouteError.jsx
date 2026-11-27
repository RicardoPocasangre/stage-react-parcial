import { isRouteErrorResponse, useRevalidator, useRouteError } from 'react-router'
import Button from '../components/Button.jsx'
import EmptyState from '../components/EmptyState.jsx'
import ErrorState from '../components/ErrorState.jsx'
import Link from '../components/Link.jsx'
import NotFound from './NotFound.jsx'

// Pantalla de error de una ruta: fallo de la API, evento inexistente o error
// inesperado. Siempre muestra un mensaje comprensible y permite reintentar.
export default function RouteError() {
  const error = useRouteError()
  const { revalidate, state } = useRevalidator()

  if (isRouteErrorResponse(error) && error.status === 404) return <NotFound />

  // La API respondió 404 (por ejemplo, un evento que ya no existe).
  if (error?.status === 404) {
    return (
      <EmptyState
        title="No encontramos lo que buscas"
        action={
          <Link to="/eventos">
            <Button>Ver todos los eventos</Button>
          </Link>
        }
      >
        {error.message}
      </EmptyState>
    )
  }

  const message = error?.message || 'Ocurrió un error inesperado. Intenta de nuevo.'
  return (
    <>
      <ErrorState message={message} onRetry={state === 'idle' ? revalidate : undefined} />
      <p className="back">
        <Link to="/eventos">← Volver a los eventos</Link>
      </p>
    </>
  )
}
