import { QRCodeSVG } from 'qrcode.react'
import { useNavigate } from 'react-router'
import Button from './Button.jsx'
import Stepper, { PURCHASE_STEPS } from './Stepper.jsx'
import { formatDateShort, formatMoney, formatTime } from '../utils/format.js'

// Pantalla «¡Compra confirmada!»: resumen del pago y boleto electrónico con QR.
export default function Confirmation({ receipt }) {
  const navigate = useNavigate()
  return (
    <section className="confirm" aria-labelledby="confirm-title">
      <Stepper steps={PURCHASE_STEPS} current={3} />
      <div className="confirm__card">
        <span className="confirm__check" aria-hidden="true">✓</span>
        <h1 className="confirm__title" id="confirm-title">¡Compra confirmada!</h1>
        <p className="confirm__text" role="status">
          Enviamos tus boletos a <strong>{receipt.email}</strong>. También puedes consultarlos en tu cuenta.
        </p>

        <ul className="confirm__tickets">
          {receipt.items.map((item) => (
            <li key={item.orderId} className="confirm__ticket">
              <div className="confirm__ticket-info">
                <p className="category">Boleto electrónico</p>
                <h2 className="confirm__ticket-title">{item.title}</h2>
                <p className="meta">
                  {formatDateShort(item.date)} · {formatTime(item.date)} · {item.venue}
                </p>
                <p className="meta">
                  Zona {item.zoneName} · {item.qty} {item.qty === 1 ? 'boleto' : 'boletos'}
                </p>
                <p className="confirm__code">{item.code}</p>
              </div>
              <div className="confirm__qr">
                <QRCodeSVG
                  value={item.code}
                  size={104}
                  marginSize={2}
                  title={`Código QR del boleto ${item.code}`}
                />
                <p className="confirm__qr-note">Muestra este código en la entrada</p>
              </div>
            </li>
          ))}
        </ul>

        <p className="confirm__paid">
          Total pagado <strong>{formatMoney(receipt.total)}</strong> · Ref. {receipt.reference}
        </p>
        <p className="checkout__note">Esta es una simulación: no se realizó ningún cobro ni se envió correo.</p>

        <div className="confirm__actions">
          <Button onClick={() => navigate('/boletos')}>Ver mis boletos</Button>
          <Button variant="ghost" onClick={() => navigate('/eventos')}>
            Volver a eventos
          </Button>
        </div>
      </div>
    </section>
  )
}
