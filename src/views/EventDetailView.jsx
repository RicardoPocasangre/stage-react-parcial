import { useEffect, useState } from 'react'
import Badge from '../components/Badge.jsx'
import Button from '../components/Button.jsx'
import ErrorState from '../components/ErrorState.jsx'
import LoadingState from '../components/LoadingState.jsx'
import Link from '../components/Link.jsx'
import Notice from '../components/Notice.jsx'
import QuantityInput from '../components/QuantityInput.jsx'
import ZoneOption from '../components/ZoneOption.jsx'
import { CATEGORY_ICON } from '../data/events.js'
import { useAsync } from '../hooks/useAsync.js'
import { api } from '../api/fakeApi.js'
import { available, eventAvailable, formatDateTime, formatMoney, formatTime, minPrice } from '../utils/format.js'

const MAX_PER_ORDER = 8

// Detalle del evento: información, zonas con precios y tarjeta de compra.
export default function EventDetailView({ eventId, events, cart, navigate, addToCart, simulateError }) {
  const { status, data: event, error, retry } = useAsync(
    () => api.getEvent(events, eventId, { fail: simulateError }),
    [events, eventId, simulateError],
  )
  const [zoneId, setZoneId] = useState('')
  const [qty, setQty] = useState(1)
  const [notice, setNotice] = useState(null)

  // Al cargar el evento se preselecciona la primera zona con disponibilidad.
  useEffect(() => {
    if (!event) return
    const first = event.zones.find((z) => available(z) > 0)
    setZoneId((current) => (event.zones.some((z) => z.id === current) ? current : first?.id ?? ''))
  }, [event])

  // El aviso de confirmación se oculta solo.
  useEffect(() => {
    if (!notice) return undefined
    const timer = setTimeout(() => setNotice(null), 4000)
    return () => clearTimeout(timer)
  }, [notice])

  if (status === 'loading') return <LoadingState label="Cargando el evento…" />
  if (status === 'error') {
    return (
      <>
        <ErrorState message={error.message} onRetry={retry} />
        <p className="back">
          <Link navigate={navigate} to="events">← Volver a los eventos</Link>
        </p>
      </>
    )
  }

  const zone = event.zones.find((z) => z.id === zoneId)
  const inCart = cart.find((i) => i.zoneId === zoneId)?.qty ?? 0
  const maxQty = zone ? Math.max(1, Math.min(MAX_PER_ORDER, available(zone) - inCart)) : 1
  const soldOut = event.status === 'agotado' || eventAvailable(event) === 0
  const canBuy = !soldOut && event.status === 'publicado' && zone && available(zone) - inCart > 0

  const handleAdd = (goToCart) => {
    if (!canBuy) return
    addToCart({ eventId: event.id, zoneId: zone.id, qty })
    setQty(1)
    if (goToCart) navigate('cart')
    else setNotice(`Agregaste ${qty} × ${zone.name} al carrito.`)
  }

  return (
    <div className="detail">
      <p className="back">
        <Link navigate={navigate} to="events">← Volver a los eventos</Link>
      </p>

      <article className="event-info" aria-labelledby="event-title">
        <div className={`cover cover--large cover--${event.category.toLowerCase()}`}>
          <img src={CATEGORY_ICON[event.category]} alt="" width="96" height="96" />
        </div>

        <header className="event-heading">
          <p className="event-heading__tags">
            {soldOut ? <Badge tone="danger">Agotado</Badge> : <Badge tone="success">Publicado</Badge>}
            <span className="category">{event.category}</span>
          </p>
          <h1 className="event-title" id="event-title">
            {event.title}
          </h1>
        </header>

        <ul className="event-data" aria-label="Datos del evento">
          <li className="meta">
            <img src="/img/icon-calendar.png" alt="" width="16" height="16" />
            <time dateTime={event.date}>{formatDateTime(event.date)}</time>
          </li>
          <li className="meta">
            <img src="/img/icon-pin.png" alt="" width="16" height="16" />
            {event.venue}, {event.city}
          </li>
          <li className="meta">
            <img src="/img/icon-ticket.png" alt="" width="16" height="16" />
            Puertas abren a las {event.doors}
          </li>
        </ul>

        <section className="event-section" aria-labelledby="desc-title">
          <h2 className="event-section__title" id="desc-title">Descripción</h2>
          <p className="event-section__text">{event.description}</p>
        </section>

        <section className="event-section" aria-labelledby="zones-title">
          <h2 className="event-section__title" id="zones-title">Zonas y precios</h2>
          <fieldset className="zones" disabled={soldOut}>
            <legend className="visually-hidden">Elige una zona</legend>
            {event.zones.map((z) => (
              <ZoneOption key={z.id} zone={z} selected={z.id === zoneId} onSelect={setZoneId} />
            ))}
          </fieldset>
        </section>
      </article>

      <aside className="purchase" aria-labelledby="purchase-title">
        <h2 className="visually-hidden" id="purchase-title">Resumen de compra</h2>
        <p className="price">
          <span className="price__label">Desde</span>
          <span className="price__amount">{formatMoney(minPrice(event))}</span>
        </p>
        <div className="purchase__extra">
          <p className="meta">
            <img src="/img/icon-calendar.png" alt="" width="16" height="16" />
            {formatTime(event.date)}
          </p>
          <p className="meta">
            <img src="/img/icon-pin.png" alt="" width="16" height="16" />
            {event.venue}
          </p>
        </div>

        {canBuy ? (
          <>
            <div className="purchase__qty">
              <span id="qty-label">Boletos ({zone.name})</span>
              <QuantityInput value={qty} max={maxQty} onChange={setQty} label="Cantidad de boletos" />
            </div>
            <p className="purchase__total">
              Subtotal <strong>{formatMoney(zone.price * qty)}</strong>
            </p>
            <Button block onClick={() => handleAdd(true)}>Comprar boletos</Button>
            <Button block variant="secondary" onClick={() => handleAdd(false)}>
              Agregar al carrito
            </Button>
            {notice && <Notice tone="success" onClose={() => setNotice(null)}>{notice}</Notice>}
          </>
        ) : (
          <Notice tone="warning">
            {soldOut
              ? 'Este evento está agotado.'
              : 'No quedan más boletos disponibles en esta zona para tu carrito.'}
          </Notice>
        )}
        <p className="purchase__note">Los cargos por servicio se muestran en el resumen de compra.</p>
      </aside>
    </div>
  )
}
