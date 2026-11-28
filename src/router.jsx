import { createBrowserRouter } from 'react-router'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import { dashboardLoader, eventLoader, eventsLoader, homeLoader, reportsLoader, ticketsLoader, usersLoader } from './loaders.js'
import AdminLayout from './views/AdminLayout.jsx'
import CartView from './views/CartView.jsx'
import CheckoutView from './views/CheckoutView.jsx'
import EventDetailView from './views/EventDetailView.jsx'
import EventsView from './views/EventsView.jsx'
import HomeView from './views/HomeView.jsx'
import HydrateFallback from './views/HydrateFallback.jsx'
import LoginView from './views/LoginView.jsx'
import NotFound from './views/NotFound.jsx'
import ProfileView from './views/ProfileView.jsx'
import RecoverView from './views/RecoverView.jsx'
import RegisterView from './views/RegisterView.jsx'
import RootLayout from './views/RootLayout.jsx'
import RouteError from './views/RouteError.jsx'
import TicketsView from './views/TicketsView.jsx'

const STAFF = ['administrador', 'organizador']

// El panel de administración se carga bajo demanda (code splitting): los
// clientes nunca descargan ese código.
const lazyAdmin = (load, loader) => ({
  lazy: async () => {
    const module = await load()
    return { Component: module.default, loader }
  },
})

export const routes = [
  {
    path: '/',
    Component: RootLayout,
    HydrateFallback,
    children: [
      {
        // Los errores de cada ruta se muestran dentro del layout.
        ErrorBoundary: RouteError,
        children: [
          { index: true, Component: HomeView, loader: homeLoader, handle: { title: 'Inicio' } },
          { path: 'eventos', Component: EventsView, loader: eventsLoader, handle: { title: 'Eventos' } },
          {
            path: 'eventos/:id',
            Component: EventDetailView,
            loader: eventLoader,
            handle: { title: (data) => data?.event?.title ?? 'Detalle del evento' },
          },
          { path: 'carrito', Component: CartView, loader: eventsLoader, handle: { title: 'Carrito' } },
          { path: 'checkout', Component: CheckoutView, loader: eventsLoader, handle: { title: 'Pago' } },
          { path: 'login', Component: LoginView, handle: { title: 'Iniciar sesión' } },
          { path: 'registro', Component: RegisterView, handle: { title: 'Crear cuenta' } },
          { path: 'recuperar', Component: RecoverView, handle: { title: 'Recuperar contraseña' } },

          // Rutas que exigen sesión
          {
            Component: ProtectedRoute,
            children: [
              { path: 'boletos', Component: TicketsView, loader: ticketsLoader, handle: { title: 'Mis boletos' } },
              { path: 'perfil', Component: ProfileView, loader: ticketsLoader, handle: { title: 'Mi perfil' } },
            ],
          },

          // Rutas de administración: administrador u organizador
          {
            path: 'admin',
            element: <ProtectedRoute roles={STAFF} />,
            children: [
              {
                Component: AdminLayout,
                children: [
                  {
                    index: true,
                    ...lazyAdmin(() => import('./views/admin/Dashboard.jsx'), dashboardLoader),
                    handle: { title: 'Panel de administración' },
                  },
                  {
                    path: 'eventos',
                    ...lazyAdmin(() => import('./views/admin/EventsTab.jsx'), eventsLoader),
                    handle: { title: 'Administrar eventos' },
                  },
                  {
                    path: 'inventario',
                    ...lazyAdmin(() => import('./views/admin/InventoryTab.jsx'), eventsLoader),
                    handle: { title: 'Inventario y precios' },
                  },
                  // Reportes y usuarios: solo administrador
                  {
                    element: <ProtectedRoute roles={['administrador']} />,
                    children: [
                      {
                        path: 'reportes',
                        ...lazyAdmin(() => import('./views/admin/ReportsTab.jsx'), reportsLoader),
                        handle: { title: 'Reportes' },
                      },
                      {
                        path: 'usuarios',
                        ...lazyAdmin(() => import('./views/admin/UsersTab.jsx'), usersLoader),
                        handle: { title: 'Usuarios' },
                      },
                    ],
                  },
                ],
              },
            ],
          },

          { path: '*', Component: NotFound, handle: { title: 'Página no encontrada' } },
        ],
      },
    ],
  },
]

// `basename` sale de `base` de Vite: en GitHub Pages es /stage-react-parcial.
export const basename = import.meta.env.BASE_URL.replace(/\/$/, '')

export const createAppRouter = () => createBrowserRouter(routes, { basename })
