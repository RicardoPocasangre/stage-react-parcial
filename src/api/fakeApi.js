// API simulada: promesas con latencia y errores opcionales.
// No hay backend, base de datos, pago real ni envío real de correos.

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

async function simulate(value, { fail = false, ms = 450 } = {}) {
  await wait(ms)
  if (fail) throw new Error('No pudimos conectar con el servidor simulado. Intenta de nuevo.')
  return structuredClone(value)
}

export const api = {
  getEvents: (events, opts) => simulate(events, opts),

  async getEvent(events, id, opts) {
    const event = events.find((e) => e.id === id)
    if (!event) {
      await wait(250)
      throw new Error('El evento solicitado no existe.')
    }
    return simulate(event, opts)
  },

  getOrders: (orders, userId, opts) =>
    simulate(
      orders.filter((o) => o.userId === userId),
      opts,
    ),

  // Sesión simulada: compara contra las cuentas guardadas en el navegador.
  async login(users, { email, passwordHash }, opts = {}) {
    await wait(opts.ms ?? 600)
    if (opts.fail) throw new Error('No pudimos conectar con el servidor simulado. Intenta de nuevo.')
    const found = users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase())
    if (!found || found.passwordHash !== passwordHash) {
      throw new Error('Correo o contraseña incorrectos.')
    }
    return structuredClone(found)
  },

  async register(users, { email }, opts = {}) {
    await wait(opts.ms ?? 600)
    if (opts.fail) throw new Error('No pudimos conectar con el servidor simulado. Intenta de nuevo.')
    if (users.some((u) => u.email.toLowerCase() === email.trim().toLowerCase())) {
      throw new Error('Ya existe una cuenta con ese correo.')
    }
    return true
  },

  // Recuperación simulada: no revela si el correo existe y no envía nada real.
  async recover(_email, opts = {}) {
    await wait(opts.ms ?? 700)
    if (opts.fail) throw new Error('No pudimos conectar con el servidor simulado. Intenta de nuevo.')
    return true
  },

  // Pago simulado: se rechaza una tarjeta de prueba terminada en 0000.
  async pay({ cardNumber }, opts = {}) {
    await wait(opts.ms ?? 1100)
    if (opts.fail) throw new Error('El servicio de pago simulado no respondió.')
    if (cardNumber.replace(/\s/g, '').endsWith('0000')) {
      throw new Error('La tarjeta fue rechazada. Prueba con otra tarjeta.')
    }
    return { approved: true, reference: `PAY-${Date.now().toString(36).toUpperCase()}` }
  },
}
