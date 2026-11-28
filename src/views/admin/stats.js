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

// ---------- Reportes dinámicos (a partir de las órdenes) ----------

export const PERIODS = {
  7: 'Últimos 7 días',
  30: 'Últimos 30 días',
  todo: 'Todo el historial',
}

const DAY = 24 * 60 * 60 * 1000

// Filtra las órdenes pagadas por evento y periodo.
export function filterOrders(orders, { eventId = '', period = '30' } = {}, now = new Date()) {
  const since = period === 'todo' ? 0 : now.getTime() - Number(period) * DAY
  return orders.filter(
    (o) =>
      o.status === 'pagada' &&
      (!eventId || o.eventId === eventId) &&
      new Date(o.createdAt).getTime() >= since,
  )
}

export const totals = (orders) => ({
  revenue: orders.reduce((s, o) => s + o.total, 0),
  tickets: orders.reduce((s, o) => s + o.qty, 0),
  orders: orders.length,
  average: orders.length ? orders.reduce((s, o) => s + o.total, 0) / orders.length : 0,
})

const shortDate = new Intl.DateTimeFormat('es-SV', { day: 'numeric', month: 'short' })

// Serie de ventas: por día hasta 7 días; por semana en periodos más largos.
export function salesSeries(orders, period = '30', now = new Date()) {
  if (period === '7') return salesLast7Days(orders, now)
  const first = orders.length ? Math.min(...orders.map((o) => new Date(o.createdAt).getTime())) : now.getTime()
  const days = period === 'todo' ? Math.max(7, Math.ceil((now.getTime() - first) / DAY)) : Number(period)
  const weeks = Math.min(Math.ceil(days / 7), 9)
  const buckets = Array.from({ length: weeks }, (_, i) => {
    const end = new Date(now.getTime() - (weeks - 1 - i) * 7 * DAY)
    return { end: end.getTime(), label: shortDate.format(end).replace('.', ''), value: 0 }
  })
  orders.forEach((o) => {
    const t = new Date(o.createdAt).getTime()
    const bucket = buckets.find((b) => t <= b.end && t > b.end - 7 * DAY) ?? (t <= buckets[0].end ? buckets[0] : null)
    if (bucket) bucket.value += o.total
  })
  return buckets.map(({ label, value }) => ({ label, value }))
}

export const revenueByEvent = (orders, events) =>
  events
    .map((e) => ({ label: e.title, value: orders.filter((o) => o.eventId === e.id).reduce((s, o) => s + o.total, 0) }))
    .filter((d) => d.value > 0)
    .sort((a, b) => b.value - a.value)

export const revenueByCategory = (orders, events) => {
  const byCategory = new Map()
  orders.forEach((o) => {
    const category = events.find((e) => e.id === o.eventId)?.category ?? 'Otros'
    byCategory.set(category, (byCategory.get(category) ?? 0) + o.total)
  })
  return [...byCategory].map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value)
}

// CSV de las órdenes del reporte (se descarga en el navegador).
export function ordersToCsv(orders, events) {
  const rows = orders.map((o) => [
    o.id,
    new Date(o.createdAt).toISOString(),
    events.find((e) => e.id === o.eventId)?.title ?? o.eventId,
    o.zoneName,
    o.qty,
    o.unitPrice,
    o.total,
  ])
  const header = ['orden', 'fecha', 'evento', 'zona', 'boletos', 'precio_unitario', 'total']
  const cell = (v) => `"${String(v).replaceAll('"', '""')}"`
  return [header, ...rows].map((row) => row.map(cell).join(',')).join('\n')
}
