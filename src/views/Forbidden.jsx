import Button from '../components/Button.jsx'
import EmptyState from '../components/EmptyState.jsx'
import Link from '../components/Link.jsx'
import { useSession } from '../state/StoreProvider.jsx'

// 403: hay sesión, pero el rol no alcanza para ver la sección.
export default function Forbidden() {
  const { user } = useSession()
  return (
    <EmptyState
      title="No tienes acceso a esta sección"
      action={
        <Link to="/">
          <Button>Volver al inicio</Button>
        </Link>
      }
    >
      Tu cuenta ({user?.role}) no tiene permisos para ver esta página. Solo la ven los roles autorizados.
    </EmptyState>
  )
}
