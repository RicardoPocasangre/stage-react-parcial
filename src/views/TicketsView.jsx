import { useMemo } from 'react'
import { useLoaderData, useNavigate } from 'react-router'
import Button from '../components/Button.jsx'
import EmptyState from '../components/EmptyState.jsx'
import TicketCard from '../components/TicketCard.jsx'
import { ticketCode } from '../utils/tickets.js'

// Lista de boletos del usuario. Cada orden genera un boleto (con QR) por unidad.
// La ruta está protegida y su loader trae solo las órdenes del usuario en sesión.
export default function TicketsView() {
  const { orders, events } = useLoaderData()
  const navigate = useNavigate()

  const tickets = useMemo(() => {
    const now = Date.now()
    return orders
      .flatMap((order) => {
        const event = events.find((e) => e.id === order.eventId)
        if (!event) return []
        return Array.from({ length: order.qty }, (_, i) => ({
          code: ticketCode(order.id, i + 1),
          number: i + 1,
          total: order.qty,
          zoneName: order.zoneName,
          unitPrice: order.unitPrice,
          event,
          past: new Date(event.date).getTime() < now,
        }))
      })
      .sort((a, b) => new Date(a.event.date) - new Date(b.event.date))
  }, [orders, events])

  const upcoming = tickets.filter((t) => !t.past)
  const past = tickets.filter((t) => t.past)

  return (
    <section aria-labelledby="tickets-title">
      <h1 className="page-title" id="tickets-title">Mis boletos</h1>

      {tickets.length === 0 && (
        <EmptyState
          title="Aún no tienes boletos"
          action={<Button onClick={() => navigate('/eventos')}>Explorar eventos</Button>}
        >
          Cuando compres boletos aparecerán aquí con su código QR.
        </EmptyState>
      )}
      {upcoming.length > 0 && (
        <>
          <h2 className="section-title">Próximos ({upcoming.length})</h2>
          <ul className="tickets">
            {upcoming.map((t) => (
              <li key={t.code}><TicketCard ticket={t} /></li>
            ))}
          </ul>
        </>
      )}
      {past.length > 0 && (
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
