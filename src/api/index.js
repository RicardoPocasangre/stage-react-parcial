import { available, makeId, simpleHash } from '../utils/format.js'
import { readCollection, writeCollection } from './db.js'
import { ApiError, gate } from './http.js'

// Capa de acceso a datos de STAGE. Ningún componente toca localStorage ni
// los JSON directamente: todo pasa por estas funciones asíncronas, que
// aceptan un `signal` (AbortController) para cancelar la operación.
// No hay backend real: las lecturas salen de public/api/*.json y las
// escrituras se persisten en localStorage.

const safeUser = ({ passwordHash: _hash, ...user }) => user

const withDefaults = (opts) => opts ?? {}

// ---------- Eventos ----------
const events = {
  async list(opts) {
    const { signal } = withDefaults(opts)
    await gate({ signal })
    return readCollection('events', signal)
  },

  async get(id, opts) {
    const { signal } = withDefaults(opts)
    await gate({ signal })
    const found = (await readCollection('events', signal)).find((e) => e.id === id)
    if (!found) throw new ApiError('El evento solicitado no existe.', 404)
    return found
  },

  async create(data, opts) {
    const { signal } = withDefaults(opts)
    await gate({ signal, ms: 250 })
    const all = await readCollection('events', signal)
    const event = {
      id: makeId('ev'),
      status: 'borrador',
      doors: 'Por confirmar',
      city: 'San Salvador',
      description: 'Evento creado desde el panel de administración.',
      ...data,
      zones: data.zones ?? [],
    }
    writeCollection('events', [...all, event])
    return event
  },

  async update(id, patch, opts) {
    const { signal } = withDefaults(opts)
    await gate({ signal, ms: 250 })
    const all = await readCollection('events', signal)
    if (!all.some((e) => e.id === id)) throw new ApiError('El evento solicitado no existe.', 404)
    const next = all.map((e) => (e.id === id ? { ...e, ...patch } : e))
    writeCollection('events', next)
    return next.find((e) => e.id === id)
  },

  async remove(id, opts) {
    const { signal } = withDefaults(opts)
    await gate({ signal, ms: 250 })
    const all = await readCollection('events', signal)
    writeCollection('events', all.filter((e) => e.id !== id))
    return true
  },

  // Inventario y precios: cambia precio y capacidad de una zona.
  async updateZone(eventId, zoneId, patch, opts) {
    const { signal } = withDefaults(opts)
    await gate({ signal, ms: 250 })
    const all = await readCollection('events', signal)
    const event = all.find((e) => e.id === eventId)
    const zone = event?.zones.find((z) => z.id === zoneId)
    if (!zone) throw new ApiError('La zona solicitada no existe.', 404)
    if (patch.capacity < zone.sold) {
      throw new ApiError(`La capacidad no puede ser menor que los ${zone.sold} boletos vendidos.`, 422)
    }
    writeCollection(
      'events',
      all.map((e) =>
        e.id === eventId
          ? { ...e, zones: e.zones.map((z) => (z.id === zoneId ? { ...z, ...patch } : z)) }
          : e,
      ),
    )
    return true
  },
}

// ---------- Usuarios y sesión ----------
const users = {
  async list(opts) {
    const { signal } = withDefaults(opts)
    await gate({ signal })
    return (await readCollection('users', signal)).map(safeUser)
  },

  async login({ email, password }, opts) {
    const { signal } = withDefaults(opts)
    await gate({ signal, ms: 600 })
    const found = (await readCollection('users', signal)).find(
      (u) => u.email.toLowerCase() === email.trim().toLowerCase(),
    )
    if (!found || found.passwordHash !== simpleHash(password)) {
      throw new ApiError('Correo o contraseña incorrectos.', 401)
    }
    return safeUser(found)
  },

  async register({ name, email, password }, opts) {
    const { signal } = withDefaults(opts)
    await gate({ signal, ms: 600 })
    const all = await readCollection('users', signal)
    if (all.some((u) => u.email.toLowerCase() === email.trim().toLowerCase())) {
      throw new ApiError('Ya existe una cuenta con ese correo.', 409)
    }
    const user = {
      id: makeId('u'),
      name: name.trim(),
      email: email.trim().toLowerCase(),
      role: 'cliente',
      passwordHash: simpleHash(password),
    }
    writeCollection('users', [...all, user])
    return safeUser(user)
  },

  async updateProfile(id, patch, opts) {
    const { signal } = withDefaults(opts)
    await gate({ signal, ms: 300 })
    const all = await readCollection('users', signal)
    const next = all.map((u) => (u.id === id ? { ...u, ...patch } : u))
    writeCollection('users', next)
    return safeUser(next.find((u) => u.id === id))
  },

  async changePassword(id, { current, next }, opts) {
    const { signal } = withDefaults(opts)
    await gate({ signal, ms: 400 })
    const all = await readCollection('users', signal)
    const user = all.find((u) => u.id === id)
    if (!user || user.passwordHash !== simpleHash(current)) {
      throw new ApiError('La contraseña actual no es correcta.', 422)
    }
    writeCollection('users', all.map((u) => (u.id === id ? { ...u, passwordHash: simpleHash(next) } : u)))
    return true
  },

  // Recuperación simulada: no revela si el correo existe y no envía nada real.
  async recover(_email, opts) {
    const { signal } = withDefaults(opts)
    await gate({ signal, ms: 700 })
    return true
  },
}

// ---------- Órdenes y pagos ----------
const orders = {
  async list(opts) {
    const { signal } = withDefaults(opts)
    await gate({ signal })
    return readCollection('orders', signal)
  },

  async listByUser(userId, opts) {
    const { signal } = withDefaults(opts)
    await gate({ signal })
    return (await readCollection('orders', signal)).filter((o) => o.userId === userId)
  },

  // Cobro simulado y creación de las órdenes. Se rechaza una tarjeta terminada
  // en 0000. Vuelve a comprobar la disponibilidad y actualiza los boletos
  // vendidos de cada zona. No hay pasarela real ni envío real de correos.
  async checkout({ userId, lines, cardNumber }, opts) {
    const { signal } = withDefaults(opts)
    await gate({ signal, ms: 1100 })

    const catalog = await readCollection('events', signal)
    for (const line of lines) {
      const zone = catalog.find((e) => e.id === line.eventId)?.zones.find((z) => z.id === line.zoneId)
      if (!zone || line.qty > available(zone)) {
        throw new ApiError(
          `Ya no quedan ${line.qty} boletos en la zona seleccionada. Ajusta tu carrito.`,
          409,
        )
      }
    }
    if (cardNumber.replace(/\s/g, '').endsWith('0000')) {
      throw new ApiError('La tarjeta fue rechazada. Prueba con otra tarjeta.', 402)
    }

    const reference = `PAY-${Date.now().toString(36).toUpperCase()}`
    const now = new Date().toISOString()
    const created = lines.map((line) => {
      const zone = catalog.find((e) => e.id === line.eventId).zones.find((z) => z.id === line.zoneId)
      return {
        id: makeId('ord'),
        userId,
        eventId: line.eventId,
        zoneId: line.zoneId,
        zoneName: zone.name,
        qty: line.qty,
        unitPrice: zone.price,
        total: zone.price * line.qty,
        createdAt: now,
        status: 'pagada',
        paymentRef: reference,
        last4: cardNumber.replace(/\s/g, '').slice(-4),
      }
    })

    const allOrders = await readCollection('orders', signal)
    writeCollection('orders', [...allOrders, ...created])
    writeCollection(
      'events',
      catalog.map((e) => ({
        ...e,
        zones: e.zones.map((z) => {
          const bought = lines.find((l) => l.zoneId === z.id)
          return bought ? { ...z, sold: z.sold + bought.qty } : z
        }),
      })),
    )
    return { reference, orders: created }
  },
}

export const api = { events, users, orders }
export { ApiError, isAbort } from './http.js'
