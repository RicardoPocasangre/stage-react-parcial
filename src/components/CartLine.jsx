import Button from './Button.jsx'
import QuantityInput from './QuantityInput.jsx'
import { CATEGORY_ICON } from '../data/events.js'
import { available, formatDateShort, formatMoney, formatTime } from '../utils/format.js'

// Línea del carrito: miniatura, evento, zona, cantidad editable y subtotal.
export default function CartLine({ line, onQty, onRemove }) {
  const { event, zone, qty } = line

  return (
    <li className="cart-line">
      <div className={`cart-line__thumb cover--${event.category.toLowerCase()}`} aria-hidden="true">
        <img src={CATEGORY_ICON[event.category]} alt="" width="24" height="24" />
      </div>
      <div className="cart-line__info">
        <p className="cart-line__title">{event.title}</p>
        <p className="cart-line__meta">
          {formatDateShort(event.date)} · {formatTime(event.date)} · {event.venue}
        </p>
        <p className="cart-line__meta">
          Zona {zone.name} · {formatMoney(zone.price)} por boleto
        </p>
      </div>
      <QuantityInput
        value={qty}
        max={Math.min(8, available(zone))}
        onChange={onQty}
        label={`Cantidad de boletos ${zone.name} de ${event.title}`}
      />
      <p className="cart-line__total">{formatMoney(zone.price * qty)}</p>
      <Button variant="ghost" size="sm" onClick={onRemove} aria-label={`Quitar ${zone.name} de ${event.title}`}>
        Quitar
      </Button>
    </li>
  )
}
