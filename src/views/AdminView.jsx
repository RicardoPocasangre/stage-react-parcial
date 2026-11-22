import { useState } from 'react'
import Button from '../components/Button.jsx'
import Notice from '../components/Notice.jsx'
import Dashboard from './admin/Dashboard.jsx'
import EventsTab from './admin/EventsTab.jsx'
import InventoryTab from './admin/InventoryTab.jsx'
import ReportsTab from './admin/ReportsTab.jsx'
import UsersTab from './admin/UsersTab.jsx'

const SECTIONS = [
  { id: 'dashboard', label: 'Panel' },
  { id: 'events', label: 'Eventos' },
  { id: 'inventory', label: 'Inventario y precios' },
  { id: 'users', label: 'Usuarios', adminOnly: true },
  { id: 'reports', label: 'Reportes' },
]

// Panel de administración (datos simulados) con barra lateral, como en el
// prototipo. Solo para administradores y organizadores.
export default function AdminView({ user, events, setEvents, orders, users, navigate }) {
  const [section, setSection] = useState('dashboard')
  const [creating, setCreating] = useState(false)

  if (!user || (user.role !== 'administrador' && user.role !== 'organizador')) {
    return (
      <Notice tone="warning">
        Esta sección es solo para administradores y organizadores.{' '}
        <button type="button" className="inline-link inline-link--button" onClick={() => navigate('login', { redirect: 'admin' })}>
          Iniciar sesión
        </button>
      </Notice>
    )
  }

  const isAdmin = user.role === 'administrador'
  const items = SECTIONS.filter((s) => isAdmin || !s.adminOnly)
  const current = items.find((s) => s.id === section) ?? items[0]

  const openCreate = () => {
    setSection('events')
    setCreating(true)
  }

  return (
    <section className="admin" aria-labelledby="admin-title">
      <nav className="admin__nav" aria-label="Secciones del panel">
        <ul className="admin__menu">
          {items.map((s) => (
            <li key={s.id}>
              <button
                type="button"
                className="admin__link"
                aria-current={current.id === s.id ? 'page' : undefined}
                onClick={() => setSection(s.id)}
              >
                {s.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <div className="admin__content">
        <header className="admin__header">
          <div>
            <h1 className="page-title" id="admin-title">
              {current.id === 'dashboard' ? 'Panel de administración' : current.label}
            </h1>
            {current.id === 'dashboard' && (
              <p className="admin__subtitle">Resumen de ventas y actividad de la plataforma.</p>
            )}
          </div>
          <Button onClick={openCreate}>Crear evento</Button>
        </header>

        <div className="admin__panel">
          {current.id === 'dashboard' && <Dashboard events={events} orders={orders} users={users} />}
          {current.id === 'events' && (
            <EventsTab
              events={events}
              setEvents={setEvents}
              creating={creating}
              onCloseCreate={() => setCreating(false)}
            />
          )}
          {current.id === 'inventory' && <InventoryTab events={events} setEvents={setEvents} />}
          {current.id === 'users' && <UsersTab users={users} orders={orders} />}
          {current.id === 'reports' && <ReportsTab events={events} />}
        </div>
      </div>
    </section>
  )
}
