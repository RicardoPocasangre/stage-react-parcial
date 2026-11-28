import { NavLink, Outlet, useMatches, useNavigate } from 'react-router'
import Button from '../components/Button.jsx'
import { useSession } from '../state/StoreProvider.jsx'

const SECTIONS = [
  { to: '/admin', label: 'Panel', end: true },
  { to: '/admin/eventos', label: 'Eventos' },
  { to: '/admin/inventario', label: 'Inventario y precios' },
  { to: '/admin/usuarios', label: 'Usuarios', adminOnly: true },
  { to: '/admin/reportes', label: 'Reportes', adminOnly: true },
]

// Estructura del panel: barra lateral (rutas anidadas) y contenido de cada
// sección. Los organizadores no ven Usuarios ni Reportes (solo administrador).
export default function AdminLayout() {
  const { isAdmin } = useSession()
  const navigate = useNavigate()
  const matches = useMatches()
  const current = [...matches].reverse().find((m) => m.handle?.title)
  const isDashboard = matches[matches.length - 1]?.pathname.replace(/\/$/, '').endsWith('/admin')

  return (
    <section className="admin" aria-labelledby="admin-title">
      <nav className="admin__nav" aria-label="Secciones del panel">
        <ul className="admin__menu">
          {SECTIONS.filter((s) => isAdmin || !s.adminOnly).map((s) => (
            <li key={s.to}>
              <NavLink className="admin__link" to={s.to} end={s.end}>
                {s.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="admin__content">
        <header className="admin__header">
          <div>
            <h1 className="page-title" id="admin-title">
              {current?.handle.title ?? 'Panel de administración'}
            </h1>
            {isDashboard && <p className="admin__subtitle">Resumen de ventas y actividad de la plataforma.</p>}
          </div>
          <Button onClick={() => navigate('/admin/eventos?nuevo=1')}>Crear evento</Button>
        </header>

        <div className="admin__panel">
          <Outlet />
        </div>
      </div>
    </section>
  )
}
