import { isValidEmail } from './format.js'

// Cada validador devuelve un objeto { campo: 'mensaje' }; vacío si todo es válido.

export function formatCardNumber(value) {
  return value
    .replace(/\D/g, '')
    .slice(0, 16)
    .replace(/(.{4})/g, '$1 ')
    .trim()
}

export function formatExpiry(value) {
  const digits = value.replace(/\D/g, '').slice(0, 4)
  return digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits
}

export function validateCard({ holder, number, expiry, cvv, email }, now = new Date()) {
  const errors = {}
  if (holder.trim().length < 3) errors.holder = 'Escribe el nombre como aparece en la tarjeta.'
  if (!isValidEmail(email.trim())) errors.email = 'Escribe un correo válido, por ejemplo nombre@correo.com.'
  if (number.replace(/\s/g, '').length !== 16) errors.number = 'El número debe tener 16 dígitos.'

  const match = /^(\d{2})\/(\d{2})$/.exec(expiry)
  if (!match) {
    errors.expiry = 'Usa el formato MM/AA.'
  } else {
    const month = Number(match[1])
    const year = 2000 + Number(match[2])
    const endOfMonth = new Date(year, month, 0, 23, 59, 59)
    if (month < 1 || month > 12) errors.expiry = 'El mes debe estar entre 01 y 12.'
    else if (endOfMonth < now) errors.expiry = 'La tarjeta está vencida.'
  }

  if (!/^\d{3,4}$/.test(cvv)) errors.cvv = 'El código de seguridad tiene 3 o 4 dígitos.'
  return errors
}

export function validateLogin({ email, password }) {
  const errors = {}
  if (!isValidEmail(email.trim())) errors.email = 'Escribe un correo válido.'
  if (!password) errors.password = 'Escribe tu contraseña.'
  return errors
}

export function validateRegister({ name, email, password, confirm }) {
  const errors = {}
  if (name.trim().length < 3) errors.name = 'Escribe tu nombre completo (mínimo 3 caracteres).'
  if (!isValidEmail(email.trim())) errors.email = 'Escribe un correo válido.'
  if (password.length < 8 || !/\d/.test(password) || !/[A-Za-z]/.test(password)) {
    errors.password = 'La contraseña debe tener al menos 8 caracteres, con letras y números.'
  }
  if (confirm !== password) errors.confirm = 'Las contraseñas no coinciden.'
  return errors
}
