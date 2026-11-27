export const FEE_RATE = 0.05

// Une cada línea del carrito (evento + zona + cantidad) con los datos actuales
// del catálogo y calcula subtotal, cargo por servicio y total. Las líneas cuyo
// evento o zona ya no existen se descartan.
export function priceCart(items, events) {
  const lines = items
    .map((item) => {
      const event = events.find((e) => e.id === item.eventId)
      const zone = event?.zones.find((z) => z.id === item.zoneId)
      return event && zone ? { ...item, event, zone } : null
    })
    .filter(Boolean)

  const subtotal = lines.reduce((sum, l) => sum + l.zone.price * l.qty, 0)
  const fee = Math.round(subtotal * FEE_RATE * 100) / 100
  return { lines, subtotal, fee, total: subtotal + fee }
}
