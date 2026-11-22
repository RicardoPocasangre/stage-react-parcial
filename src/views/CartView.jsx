import { useEffect, useRef, useState } from 'react'
import Button from '../components/Button.jsx'
import CartLine from '../components/CartLine.jsx'
import Confirmation from '../components/Confirmation.jsx'
import EmptyState from '../components/EmptyState.jsx'
import Link from '../components/Link.jsx'
import Notice from '../components/Notice.jsx'
import OrderSummary from '../components/OrderSummary.jsx'
import PaymentForm from '../components/PaymentForm.jsx'
import Stepper, { PURCHASE_STEPS } from '../components/Stepper.jsx'
import { api } from '../api/fakeApi.js'
import { available, formatMoney, makeId } from '../utils/format.js'
import { validateCard } from '../utils/validation.js'

const FEE_RATE = 0.05

// Flujo de compra: carrito → pago simulado → confirmación.
export default function CartView({ events, setEvents, setOrders, user, cart, setCart, navigate, simulateError }) {
  const [step, setStep] = useState(0) // 0 carrito, 1 pago, 2 confirmación
  const [card, setCard] = useState({ holder: '', number: '', expiry: '', cvv: '', email: user?.email ?? '' })
  const [errors, setErrors] = useState({})
  const [processing, setProcessing] = useState(false)
  const [payError, setPayError] = useState('')
  const [receipt, setReceipt] = useState(null)
  const submitting = useRef(false) // evita el doble envío del pago
  const mounted = useRef(true)

  useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
    }
  }, [])

  const lines = cart
    .map((item) => {
      const event = events.find((e) => e.id === item.eventId)
      const zone = event?.zones.find((z) => z.id === item.zoneId)
      return event && zone ? { ...item, event, zone } : null
    })
    .filter(Boolean)

  const subtotal = lines.reduce((sum, l) => sum + l.zone.price * l.qty, 0)
  const fee = Math.round(subtotal * FEE_RATE * 100) / 100
  const total = subtotal + fee

  const setQty = (zoneId, qty) =>
    setCart((prev) => prev.map((i) => (i.zoneId === zoneId ? { ...i, qty } : i)))
  const remove = (zoneId) => setCart((prev) => prev.filter((i) => i.zoneId !== zoneId))

  const goToStep = (next) => {
    setErrors({})
    setPayError('')
    setStep(next)
  }

  // Actualiza un campo de la tarjeta y limpia su mensaje de error al corregirlo
  const updateCard = (key, value) => {
    setCard((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => ({ ...prev, [key]: undefined }))
  }

  const submitPayment = async () => {
    if (submitting.current) return
    const found = validateCard(card)
    setErrors(found)
    if (Object.keys(found).length > 0) return

    // Se vuelve a comprobar la disponibilidad justo antes de cobrar.
    const stale = lines.find((l) => l.qty > available(l.zone))
    if (stale) {
      setPayError(`Ya no quedan ${stale.qty} boletos en ${stale.zone.name} (${stale.event.title}). Ajusta tu carrito.`)
      return
    }

    submitting.current = true
    setProcessing(true)
    setPayError('')
    try {
      const payment = await api.pay({ cardNumber: card.number }, { fail: simulateError })
      if (!mounted.current) return

      const now = new Date().toISOString()
      const created = lines.map((l) => ({
        id: makeId('ord'),
        userId: user.id,
        eventId: l.event.id,
        zoneId: l.zone.id,
        zoneName: l.zone.name,
        qty: l.qty,
        unitPrice: l.zone.price,
        total: l.zone.price * l.qty,
        createdAt: now,
        status: 'pagada',
        paymentRef: payment.reference,
        last4: card.number.replace(/\s/g, '').slice(-4),
      }))

      setOrders((prev) => [...prev, ...created])
      setEvents((prev) =>
        prev.map((e) => ({
          ...e,
          zones: e.zones.map((z) => {
            const bought = lines.find((l) => l.zone.id === z.id)
            return bought ? { ...z, sold: z.sold + bought.qty } : z
          }),
        })),
      )
      setReceipt({
        reference: payment.reference,
        total,
        email: card.email.trim(),
        items: created.map((o, i) => ({
          orderId: o.id,
          title: lines[i].event.title,
          date: lines[i].event.date,
          venue: lines[i].event.venue,
          zoneName: o.zoneName,
          qty: o.qty,
        })),
      })
      setCart([])
      setCard({ holder: '', number: '', expiry: '', cvv: '', email: card.email }) // no se conserva la tarjeta
      goToStep(2)
    } catch (error) {
      if (mounted.current) setPayError(error.message)
    } finally {
      submitting.current = false
      if (mounted.current) setProcessing(false)
    }
  }

  if (step === 2 && receipt) return <Confirmation receipt={receipt} navigate={navigate} />

  if (lines.length === 0) {
    return (
      <EmptyState
        title="Tu carrito está vacío"
        action={<Button onClick={() => navigate('events')}>Explorar eventos</Button>}
      >
        Agrega boletos desde el detalle de un evento para comenzar tu compra.
      </EmptyState>
    )
  }

  return (
    <section className="checkout" aria-labelledby="checkout-title">
      <h1 className="page-title" id="checkout-title">{step === 0 ? 'Tu carrito' : 'Pago'}</h1>
      <Stepper steps={PURCHASE_STEPS} current={step + 1} />

      <div className="checkout__layout">
        <div className="checkout__main">
          {step === 0 && (
            <>
              <ul className="cart-lines">
                {lines.map((line) => (
                  <CartLine
                    key={line.zone.id}
                    line={line}
                    onQty={(qty) => setQty(line.zone.id, qty)}
                    onRemove={() => remove(line.zone.id)}
                  />
                ))}
              </ul>
              {!user && (
                <Notice tone="warning">
                  Para pagar necesitas una cuenta.{' '}
                  <Link navigate={navigate} to="login" params={{ redirect: 'cart' }} className="inline-link">Inicia sesión</Link> o{' '}
                  <Link navigate={navigate} to="register" className="inline-link">crea una cuenta</Link>; tu
                  carrito se conserva.
                </Notice>
              )}
            </>
          )}

          {step === 1 && (
            <PaymentForm
              card={card}
              errors={errors}
              payError={payError}
              onChange={updateCard}
              onSubmit={submitPayment}
            />
          )}
        </div>

        <OrderSummary lines={lines} subtotal={subtotal} fee={fee} total={total}>
          {step === 0 && (
            <>
              <Button block disabled={!user} onClick={() => goToStep(1)}>Continuar al pago</Button>
              <Button block variant="ghost" onClick={() => navigate('events')}>Seguir comprando</Button>
            </>
          )}
          {step === 1 && (
            <>
              <Button block loading={processing} onClick={submitPayment}>
                {processing ? 'Procesando…' : `Pagar ${formatMoney(total)}`}
              </Button>
              <Button block variant="ghost" onClick={() => goToStep(0)} disabled={processing}>
                Volver al carrito
              </Button>
              <p className="summary__secure">Pago seguro y cifrado (simulado)</p>
            </>
          )}
        </OrderSummary>
      </div>
    </section>
  )
}
