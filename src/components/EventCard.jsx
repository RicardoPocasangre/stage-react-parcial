import { CATEGORY_ICON } from '../data/events.js'
import { asset } from '../utils/assets.js'
import { eventAvailable, formatDateShort, formatMoney, formatTime, minPrice } from '../utils/format.js'
import Badge from './Badge.jsx'
import Link from './Link.jsx'

// Tarjeta de evento del listado.
export default function EventCard({ event }) {
  const left = eventAvailable(event)
  const soldOut = event.status === 'agotado' || left === 0
  const past = event.status === 'finalizado'

  return (
    <article className="event-card">
      <div className={`cover cover--${event.category.toLowerCase()}`}>
        <img src={CATEGORY_ICON[event.category]} alt="" width="48" height="48" />
      </div>
      <div className="event-card__body">
        <p className="event-card__tags">
          <span className="category">{event.category}</span>
          {soldOut && <Badge tone="danger">Agotado</Badge>}
          {past && <Badge tone="neutral">Finalizado</Badge>}
          {!soldOut && !past && left <= 50 && <Badge tone="warning">Últimos boletos</Badge>}
        </p>
        <h3 className="event-card__title">
          <Link to={`/eventos/${event.id}`}>{event.title}</Link>
        </h3>
        <p className="meta">
          <img src={asset('img/icon-calendar.png')} alt="" width="16" height="16" />
          <time dateTime={event.date}>
            {formatDateShort(event.date)} · {formatTime(event.date)}
          </time>
        </p>
        <p className="meta">
          <img src={asset('img/icon-pin.png')} alt="" width="16" height="16" />
          {event.venue}
        </p>
        <div className="event-card__footer">
          <p className="event-card__price">
            <span className="event-card__price-label">Desde</span>
            {formatMoney(minPrice(event))}
          </p>
          <span className="event-card__go" aria-hidden="true">
            <img src={asset('img/icon-arrow-right.png')} alt="" width="16" height="16" />
          </span>
        </div>
      </div>
    </article>
  )
}
