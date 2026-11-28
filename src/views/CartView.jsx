import { useLoaderData, useNavigate } from 'react-router'
import Button from '../components/Button.jsx'
import CartLine from '../components/CartLine.jsx'
import EmptyState from '../components/EmptyState.jsx'
import Link from '../components/Link.jsx'
import Notice from '../components/Notice.jsx'
import OrderSummary from '../components/OrderSummary.jsx'
import Stepper, { PURCHASE_STEPS } from '../components/Stepper.jsx'
import { useCart, useSession } from '../state/StoreProvider.jsx'
import { priceCart } from '../utils/cart.js'

// Paso 2 de la compra: carrito y resumen. El estado vive en el Context global,
// así el carrito se comparte con el encabezado, el detalle y el pago.
export default function CartView() {
  const { events } = useLoaderData()
  const { items, setQty, remove } = useCart()
  const { user } = useSession()
  const navigate = useNavigate()

  const { lines, subtotal, fee, total } = priceCart(items, events)

  if (lines.length === 0) {
    return (
      <EmptyState title="Tu carrito está vacío" action={<Button onClick={() => navigate('/eventos')}>Explorar eventos</Button>}>
        Agrega boletos desde el detalle de un evento para comenzar tu compra.
      </EmptyState>
    )
  }

  return (
    <section className="checkout" aria-labelledby="checkout-title">
      <h1 className="page-title" id="checkout-title">Tu carrito</h1>
      <Stepper steps={PURCHASE_STEPS} current={1} />

      <div className="checkout__layout">
        <div className="checkout__main">
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
              <Link to="/login?redirect=%2Fcarrito" className="inline-link">Inicia sesión</Link> o{' '}
              <Link to="/registro" className="inline-link">crea una cuenta</Link>; tu carrito se conserva.
            </Notice>
          )}
        </div>

        <OrderSummary lines={lines} subtotal={subtotal} fee={fee} total={total}>
          <Button block disabled={!user} onClick={() => navigate('/checkout')}>Continuar al pago</Button>
          <Button block variant="ghost" onClick={() => navigate('/eventos')}>Seguir comprando</Button>
        </OrderSummary>
      </div>
    </section>
  )
}
