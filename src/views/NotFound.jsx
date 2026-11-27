import Button from '../components/Button.jsx'
import EmptyState from '../components/EmptyState.jsx'
import Link from '../components/Link.jsx'

// 404 para cualquier ruta que no exista.
export default function NotFound() {
  return (
    <EmptyState
      title="Página no encontrada"
      action={
        <Link to="/">
          <Button>Ir al inicio</Button>
        </Link>
      }
    >
      La dirección que buscas no existe o fue movida. Revisa el enlace o vuelve a los eventos.
    </EmptyState>
  )
}
