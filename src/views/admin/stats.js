// Cálculos del panel de administración a partir del catálogo y las órdenes.

export const eventSold = (e) => e.zones.reduce((s, z) => s + z.sold, 0)
export const eventCapacity = (e) => e.zones.reduce((s, z) => s + z.capacity, 0)
export const eventRevenue = (e) => e.zones.reduce((s, z) => s + z.sold * z.price, 0)
export const occupancy = (e) => (eventCapacity(e) ? Math.round((eventSold(e) / eventCapacity(e)) * 100) : 0)

export function summary(events) {
  const sold = events.reduce((s, e) => s + eventSold(e), 0)
  const capacity = events.reduce((s, e) => s + eventCapacity(e), 0)
  return {
    revenue: events.reduce((s, e) => s + eventRevenue(e), 0),
    sold,
    active: events.filter((e) => e.status === 'publicado').length,
    occupancy: capacity ? Math.round((sold / capacity) * 100) : 0,
  }
}

const dayKey = (date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`

const weekday = new Intl.DateTimeFormat('es-SV', { weekday: 'short' })

// Ventas (USD) por día de los últimos 7 días, contando órdenes pagadas.
export function salesLast7Days(orders, today = new Date()) {
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today)
    d.setDate(today.getDate() - (6 - i))
    return { key: dayKey(d), label: weekday.format(d).replace('.', ''), value: 0 }
  })
  orders
    .filter((o) => o.status === 'pagada')
    .forEach((o) => {
      const day = days.find((d) => d.key === dayKey(new Date(o.createdAt)))
      if (day) day.value += o.total
    })
  return days
}

export const topEvents = (events, n = 4) =>
  [...events]
    .map((e) => ({ label: e.title, value: eventSold(e) }))
    .sort((a, b) => b.value - a.value)
    .slice(0, n)
