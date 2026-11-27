import { Navigate, Outlet, useLocation } from 'react-router'
import { useSession } from '../state/StoreProvider.jsx'
import Forbidden from '../views/Forbidden.jsx'

// Ruta protegida por sesión y, opcionalmente, por rol. Sin sesión redirige a
// /login conservando la ruta de origen; con sesión pero sin el rol muestra 403.
export default function ProtectedRoute({ roles }) {
  const { user } = useSession()
  const location = useLocation()

  if (!user) {
    const redirect = encodeURIComponent(`${location.pathname}${location.search}`)
    return <Navigate to={`/login?redirect=${redirect}`} replace />
  }
  if (roles && !roles.includes(user.role)) return <Forbidden />
  return <Outlet />
}
