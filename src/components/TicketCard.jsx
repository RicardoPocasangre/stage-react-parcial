import { QRCodeSVG } from 'qrcode.react'
import Badge from './Badge.jsx'
import { asset } from '../utils/assets.js'
import { formatDateTime, formatMoney } from '../utils/format.js'

// Boleto electrónico: datos del evento y código QR generado en el cliente.
export default function TicketCard({ ticket }) {
  const { event, zoneName, code, number, total, past, unitPrice } = ticket

  return (
    <article className={`ticket${past ? ' is-past' : ''}`} aria-label={`Boleto ${code}`}>
      <div className="ticket__main">
        <p className="ticket__tags">
          <span className="category">{event.category}</span>
          {past ? <Badge tone="neutral">Evento finalizado</Badge> : <Badge tone="success">Válido</Badge>}
        </p>
        <h3 className="ticket__title">{event.title}</h3>
        <p className="meta">
          <img src={asset('img/icon-calendar.png')} alt="" width="16" height="16" />
          <time dateTime={event.date}>{formatDateTime(event.date)}</time>
        </p>
        <p className="meta">
          <img src={asset('img/icon-pin.png')} alt="" width="16" height="16" />
          {event.venue}, {event.city}
        </p>
        <p className="ticket__zone">
          Zona <strong>{zoneName}</strong> · Boleto {number} de {total} · {formatMoney(unitPrice)}
        </p>
        <p className="ticket__code">{code}</p>
      </div>
      <div className="ticket__qr">
        <QRCodeSVG value={code} size={112} marginSize={2} title={`Código QR del boleto ${code}`} />
      </div>
    </article>
  )
}
