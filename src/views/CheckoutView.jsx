import { useEffect, useRef, useState } from 'react'
import { useLoaderData, useNavigate, useRevalidator } from 'react-router'
import { api, isAbort } from '../api/index.js'
import Button from '../components/Button.jsx'
import Confirmation from '../components/Confirmation.jsx'
import EmptyState from '../components/EmptyState.jsx'
import Link from '../components/Link.jsx'
import Notice from '../components/Notice.jsx'
import OrderSummary from '../components/OrderSummary.jsx'
import PaymentForm from '../components/PaymentForm.jsx'
import Stepper, { PURCHASE_STEPS } from '../components/Stepper.jsx'
import { useCart, useSession } from '../state/StoreProvider.jsx'
import { priceCart } from '../utils/cart.js'
import { available, formatMoney } from '../utils/format.js'
import { ticketCode } from '../utils/tickets.js'
import { validateCard } from '../utils/validation.js'

// Pasos 3 y 4 de la compra: pago simulado y confirmación con los boletos (QR).
export default function CheckoutView() {
  const { events } = useLoaderData()
  const { items, clear } = useCart()
  const { user } = useSession()
  const navigate = useNavigate()
  const { revalidate } = useRevalidator()

  const [card, setCard] = useState({ holder: '', number: '', expiry: '', cvv: '', email: user?.email ?? '' })
  const [errors, setErrors] = useState({})
  const [processing, setProcessing] = useState(false)
  const [payError, setPayError] = useState('')
  const [receipt, setReceipt] = useState(null)
  const submitting = useRef(false) // evita el doble envío del pago
  const controller = useRef(null)

  // Si se abandona la pantalla durante el pago, se cancela la solicitud.
  useEffect(() => () => controller.current?.abort(), [])

  const { lines, fee, subtotal, total } = priceCart(items, events)

  const updateCard = (key, value) => {
    setCard((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => ({ ...prev, [key]: undefined }))
  }

  const submitPayment = async () => {
    if (submitting.current) return
    const found = validateCard(card)
    setErrors(found)
    if (Object.keys(found).length > 0) return

    const stale = lines.find((l) => l.qty > available(l.zone))
    if (stale) {
      setPayError(`Ya no quedan ${stale.qty} boletos en ${stale.zone.name} (${stale.event.title}). Ajusta tu carrito.`)
      return
    }

    submitting.current = true
    setProcessing(true)
    setPayError('')
    controller.current = new AbortController()
    try {
      const { reference, orders } = await api.orders.checkout(
        {
          userId: user.id,
          lines: lines.map(({ eventId, zoneId, qty }) => ({ eventId, zoneId, qty })),
          cardNumber: card.number,
        },
        { signal: controller.current.signal },
      )

      setReceipt({
        reference,
        total,
        email: card.email.trim(),
        items: orders.map((order, i) => ({
          orderId: order.id,
          code: ticketCode(order.id, 1),
          title: lines[i].event.title,
          date: lines[i].event.date,
          venue: lines[i].event.venue,
          zoneName: order.zoneName,
          qty: order.qty,
        })),
      })
      clear()
      setCard({ holder: '', number: '', expiry: '', cvv: '', email: card.email }) // no se conserva la tarjeta
      revalidate() // el catálogo ya descontó los boletos vendidos
    } catch (error) {
      if (!isAbort(error)) setPayError(error.message)
    } finally {
      submitting.current = false
      setProcessing(false)
    }
  }

  if (receipt) return <Confirmation receipt={receipt} />

  if (lines.length === 0) {
    return (
      <EmptyState title="No hay nada que pagar" action={<Button onClick={() => navigate('/eventos')}>Explorar eventos</Button>}>
        Agrega boletos desde el detalle de un evento para comenzar tu compra.
      </EmptyState>
    )
  }

  if (!user) {
    return (
      <Notice tone="warning">
        Para pagar necesitas una cuenta.{' '}
        <Link to="/login?redirect=%2Fcheckout" className="inline-link">Inicia sesión</Link> o{' '}
        <Link to="/registro" className="inline-link">crea una cuenta</Link>; tu carrito se conserva.
      </Notice>
    )
  }

  return (
    <section className="checkout" aria-labelledby="checkout-title">
      <h1 className="page-title" id="checkout-title">Pago</h1>
      <Stepper steps={PURCHASE_STEPS} current={2} />

      <div className="checkout__layout">
        <div className="checkout__main">
          <PaymentForm card={card} errors={errors} payError={payError} onChange={updateCard} onSubmit={submitPayment} />
        </div>

        <OrderSummary lines={lines} subtotal={subtotal} fee={fee} total={total}>
          <Button block loading={processing} onClick={submitPayment}>
            {processing ? 'Procesando…' : `Pagar ${formatMoney(total)}`}
          </Button>
          <Button block variant="ghost" onClick={() => navigate('/carrito')} disabled={processing}>
            Volver al carrito
          </Button>
          <p className="summary__secure">Pago seguro y cifrado (simulado)</p>
        </OrderSummary>
      </div>
    </section>
  )
}
