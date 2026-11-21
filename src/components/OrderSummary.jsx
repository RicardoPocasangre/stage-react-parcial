import { formatMoney } from '../utils/format.js'

// Resumen de compra reutilizable (subtotal, cargo por servicio y total).
// Los hijos se muestran al final: aquí van las acciones del paso actual.
export default function OrderSummary({ lines, subtotal, fee, total, children }) {
  const tickets = lines.reduce((sum, l) => sum + l.qty, 0)

  return (
    <aside className="summary" aria-labelledby="summary-title">
      <h2 className="summary__title" id="summary-title">
        Resumen de compra
      </h2>
      <ul className="summary__lines">
        {lines.map((l) => (
          <li key={l.zone.id} className="summary__line">
            <span>
              {l.qty} × {l.zone.name} · {l.event.title}
            </span>
            <span>{formatMoney(l.zone.price * l.qty)}</span>
          </li>
        ))}
      </ul>
      <dl className="summary__totals">
        <div>
          <dt>Subtotal ({tickets} {tickets === 1 ? 'boleto' : 'boletos'})</dt>
          <dd>{formatMoney(subtotal)}</dd>
        </div>
        <div>
          <dt>Cargo por servicio (5 %)</dt>
          <dd>{formatMoney(fee)}</dd>
        </div>
        <div className="summary__total">
          <dt>Total</dt>
          <dd>{formatMoney(total)}</dd>
        </div>
      </dl>
      {children && <div className="summary__actions">{children}</div>}
    </aside>
  )
}
