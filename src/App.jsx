import { useCallback, useEffect, useRef, useState } from 'react'
import Footer from './components/Footer.jsx'
import Header from './components/Header.jsx'
import AdminView from './views/AdminView.jsx'
import CartView from './views/CartView.jsx'
import LoginView from './views/LoginView.jsx'
import ProfileView from './views/ProfileView.jsx'
import RecoverView from './views/RecoverView.jsx'
import RegisterView from './views/RegisterView.jsx'
import TicketsView from './views/TicketsView.jsx'
import EventDetailView from './views/EventDetailView.jsx'
import EventsView from './views/EventsView.jsx'
import { seedEvents, seedOrders, seedUsers } from './data/events.js'
import { useLocalStorage } from './hooks/useLocalStorage.js'

const TITLES = {
  events: 'Eventos',
  event: 'Detalle del evento',
  cart: 'Carrito',
  login: 'Iniciar sesión',
  register: 'Crear cuenta',
  recover: 'Recuperar contraseña',
  profile: 'Mi perfil',
  tickets: 'Mis boletos',
  admin: 'Panel de administración',
}

// Raíz de la aplicación: concentra el estado compartido (sesión, carrito,
// catálogo, órdenes y preferencias) y lo reparte a las vistas por props.
export default function App() {
  const [route, setRoute] = useState({ name: 'events', params: {} })
  const [events, setEvents] = useLocalStorage('stage.events.v2', seedEvents)
  const [orders, setOrders] = useLocalStorage('stage.orders.v2', seedOrders)
  const [users, setUsers] = useLocalStorage('stage.users', seedUsers)
  const [sessionId, setSessionId] = useLocalStorage('stage.session', null)
  const [cart, setCart] = useLocalStorage('stage.cart', [])
  const [prefs, setPrefs] = useLocalStorage('stage.prefs', { simulateError: false })
  const [filters, setFilters] = useState({ query: '', category: '', sort: 'fecha' })
  const mainRef = useRef(null)

  const user = users.find((u) => u.id === sessionId) ?? null
  const cartCount = cart.reduce((sum, item) => sum + item.qty, 0)

  const navigate = useCallback((name, params = {}) => {
    setRoute({ name, params })
  }, [])

  // Al cambiar de vista: título del documento, scroll arriba y foco en el contenido.
  useEffect(() => {
    document.title = `${TITLES[route.name] ?? 'STAGE'} · STAGE`
    window.scrollTo(0, 0)
    mainRef.current?.focus({ preventScroll: true })
  }, [route])

  const addToCart = useCallback(
    ({ eventId, zoneId, qty }) => {
      setCart((prev) => {
        const existing = prev.find((i) => i.zoneId === zoneId)
        if (existing) {
          return prev.map((i) => (i.zoneId === zoneId ? { ...i, qty: i.qty + qty } : i))
        }
        return [...prev, { eventId, zoneId, qty }]
      })
    },
    [setCart],
  )

  const logout = () => {
    setSessionId(null)
    navigate('events')
  }

  const shared = {
    events,
    setEvents,
    orders,
    setOrders,
    users,
    setUsers,
    user,
    setSessionId,
    cart,
    setCart,
    addToCart,
    navigate,
    onLogout: logout,
    simulateError: prefs.simulateError,
  }

  const renderView = () => {
    switch (route.name) {
      case 'login':
        return <LoginView {...shared} redirect={route.params.redirect} />
      case 'register':
        return <RegisterView {...shared} />
      case 'recover':
        return <RecoverView {...shared} />
      case 'profile':
        return <ProfileView {...shared} />
      case 'tickets':
        return <TicketsView {...shared} />
      case 'admin':
        return <AdminView {...shared} />
      case 'cart':
        return <CartView {...shared} />
      case 'event':
        return <EventDetailView eventId={route.params.id} {...shared} />
      case 'events':
      default:
        return <EventsView {...shared} filters={filters} setFilters={setFilters} />
    }
  }

  return (
    <>
      <a className="skip-link" href="#contenido">
        Saltar al contenido
      </a>
      <Header
        route={route}
        user={user}
        cartCount={cartCount}
        navigate={navigate}
        onLogout={logout}
      />
      <main className="page" id="contenido" tabIndex={-1} ref={mainRef}>
        {renderView()}
      </main>
      <Footer
        simulateError={prefs.simulateError}
        onToggleError={(value) => setPrefs((p) => ({ ...p, simulateError: value }))}
      />
    </>
  )
}
