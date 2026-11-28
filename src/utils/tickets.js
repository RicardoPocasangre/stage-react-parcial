import { simpleHash } from './format.js'

// Código de boleto verificable. Formato: STG-<ORDEN>-<NN>-<CONTROL>
// El código de control se deriva de la orden y del número de boleto: permite
// comprobar que un QR no fue alterado (la verificación real requeriría un
// servidor; aquí es simulada, igual que el resto de la API).
const control = (orderId, number) =>
  simpleHash(`stage|${orderId.toUpperCase()}|${number}`).slice(1, 5).toUpperCase().padStart(4, '0')

export function ticketCode(orderId, number) {
  const nn = String(number).padStart(2, '0')
  return `STG-${orderId.toUpperCase()}-${nn}-${control(orderId, number)}`
}

// Devuelve { valid, orderId, number } o { valid: false } si el código no es válido.
export function parseTicketCode(raw) {
  const match = /^STG-(ORD-[A-Z0-9]+)-(\d{2})-([A-Z0-9]{4})$/.exec(String(raw).trim().toUpperCase())
  if (!match) return { valid: false }
  const [, orderId, nn, check] = match
  const number = Number(nn)
  return { valid: control(orderId, number) === check, orderId: orderId.toLowerCase(), number }
}
