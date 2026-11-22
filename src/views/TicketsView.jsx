import { useMemo } from 'react'
import Button from '../components/Button.jsx'
import EmptyState from '../components/EmptyState.jsx'
import ErrorState from '../components/ErrorState.jsx'
import LoadingState from '../components/LoadingState.jsx'
import Notice from '../components/Notice.jsx'
import TicketCard from '../components/TicketCard.jsx'
import { api } from '../api/fakeApi.js'
import { useAsync } from '../hooks/useAsync.js'

// Lista de boletos del usuario. Cada orden genera un boleto (con QR) por unidad.
export default function TicketsView({ user, orders, events, navigate, simulateError }) {
  const { status, data, error, retry } = useAsync(
    () => (user ? api.getOrders(orders, user.id, { fail: simulateError }) : Promise.resolve([])),
    [orders, user?.id, simulateError],
  )

  const tickets = useMemo(() => {
    if (!data) return []
    const now = Date.now()
    return data
      .flatMap((order) => {
        const event = events.find((e) => e.id === order.eventId)
        if (!event) return []
        return Array.from({ length: order.qty }, (_, i) => ({
          code: `${order.id.toUpperCase()}-${String(i + 1).padStart(2, '0')}`,
          number: i + 1,
          total: order.qty,
          zoneName: order.zoneName,
          event,
          past: new Date(event.date).getTime() < now,
        }))
      })
      .sort((a, b) => new Date(a.event.date) - new Date(b.event.date))
  }, [data, events])

  if (!user) {
    return (
      <Notice tone="warning">
        Inicia sesión para ver tus boletos.{' '}
        <button type="button" className="inline-link inline-link--button" onClick={() => navigate('login', { redirect: 'tickets' })}>
          Ir a iniciar sesión
        </button>
      </Notice>
    )
  }

  const upcoming = tickets.filter((t) => !t.past)
  const past = tickets.filter((t) => t.past)

  return (
    <section aria-labelledby="tickets-title" aria-busy={status === 'loading'}>
      <h1 className="page-title" id="tickets-title">Mis boletos</h1>

      {status === 'loading' && <LoadingState label="Cargando tus boletos…" />}
      {status === 'error' && <ErrorState message={error.message} onRetry={retry} />}
      {status === 'success' && tickets.length === 0 && (
        <EmptyState
          title="Aún no tienes boletos"
          action={<Button onClick={() => navigate('events')}>Explorar eventos</Button>}
        >
          Cuando compres boletos aparecerán aquí con su código QR.
        </EmptyState>
      )}
      {status === 'success' && upcoming.length > 0 && (
        <>
          <h2 className="section-title">Próximos ({upcoming.length})</h2>
          <ul className="tickets">
            {upcoming.map((t) => (
              <li key={t.code}><TicketCard ticket={t} /></li>
            ))}
          </ul>
        </>
      )}
      {status === 'success' && past.length > 0 && (
        <>
          <h2 className="section-title">Anteriores ({past.length})</h2>
          <ul className="tickets">
            {past.map((t) => (
              <li key={t.code}><TicketCard ticket={t} /></li>
            ))}
          </ul>
        </>
      )}
    </section>
  )
}
