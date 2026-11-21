const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })

export const formatMoney = (value) => money.format(value)

const dateLong = new Intl.DateTimeFormat('es-SV', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
})
const dateShort = new Intl.DateTimeFormat('es-SV', {
  weekday: 'short',
  day: 'numeric',
  month: 'short',
})
const timeFmt = new Intl.DateTimeFormat('es-SV', { hour: 'numeric', minute: '2-digit' })

const capitalize = (text) => text.charAt(0).toUpperCase() + text.slice(1)

export const formatDateLong = (iso) => capitalize(dateLong.format(new Date(iso)))
export const formatDateShort = (iso) => capitalize(dateShort.format(new Date(iso)))
export const formatTime = (iso) => timeFmt.format(new Date(iso))
export const formatDateTime = (iso) => `${formatDateLong(iso)} · ${formatTime(iso)}`

// Hash simulado para las cuentas de demostración: NO es seguridad real,
// la app no tiene backend y no guarda contraseñas reales.
export function simpleHash(text) {
  let h = 5381
  for (let i = 0; i < text.length; i += 1) {
    h = (h * 33) ^ text.charCodeAt(i)
  }
  return `h${(h >>> 0).toString(16)}`
}

export const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)

export const available = (zone) => Math.max(zone.capacity - zone.sold, 0)

export const eventAvailable = (event) => event.zones.reduce((sum, z) => sum + available(z), 0)

export const minPrice = (event) => Math.min(...event.zones.map((z) => z.price))

export const makeId = (prefix) =>
  `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`
