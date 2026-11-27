import { api } from './api/index.js'
import { readSession } from './state/session.js'

// Loaders del router. React Router entrega un `request.signal` (AbortController)
// que se cancela al abandonar la ruta; se pasa tal cual a la capa de API.

export const homeLoader = async ({ request }) => ({
  events: await api.events.list({ signal: request.signal }),
})

export const eventsLoader = homeLoader

export const eventLoader = async ({ params, request }) => ({
  event: await api.events.get(params.id, { signal: request.signal }),
})

export async function ticketsLoader({ request }) {
  const user = readSession()
  if (!user) return { orders: [], events: [] }
  const [orders, events] = await Promise.all([
    api.orders.listByUser(user.id, { signal: request.signal }),
    api.events.list({ signal: request.signal }),
  ])
  return { orders, events }
}

export async function dashboardLoader({ request }) {
  const opts = { signal: request.signal }
  const [events, orders, users] = await Promise.all([
    api.events.list(opts),
    api.orders.list(opts),
    api.users.list(opts),
  ])
  return { events, orders, users }
}

export async function reportsLoader({ request }) {
  const opts = { signal: request.signal }
  const [events, orders] = await Promise.all([api.events.list(opts), api.orders.list(opts)])
  return { events, orders }
}

export async function usersLoader({ request }) {
  const opts = { signal: request.signal }
  const [users, orders] = await Promise.all([api.users.list(opts), api.orders.list(opts)])
  return { users, orders }
}
