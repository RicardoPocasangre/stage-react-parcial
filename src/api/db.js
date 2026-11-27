import { getJson } from './http.js'

// «Base de datos» de la API falsa: los JSON de public/api/ son la semilla y
// las mutaciones (crear, editar, eliminar, comprar) se guardan en localStorage.
// Mientras una colección no se modifique, se lee directamente de la semilla.

const KEY = (name) => `stage.db.${name}.v3`

function readStored(name) {
  try {
    const raw = window.localStorage.getItem(KEY(name))
    return raw === null ? null : JSON.parse(raw)
  } catch {
    return null
  }
}

export function writeCollection(name, value) {
  try {
    window.localStorage.setItem(KEY(name), JSON.stringify(value))
  } catch {
    // Sin almacenamiento disponible los cambios solo viven mientras dure la pestaña.
  }
  return value
}

// Las órdenes de ejemplo traen `daysAgo` y `time` para que el panel y los
// reportes siempre tengan ventas recientes, sin importar cuándo se abra la app.
function materializeOrders(seed, now = new Date()) {
  return seed.map(({ daysAgo, time, ...order }) => {
    const [hours, minutes] = time.split(':').map(Number)
    const date = new Date(now)
    date.setDate(now.getDate() - daysAgo)
    date.setHours(hours, minutes, 0, 0)
    return { ...order, createdAt: (date > now ? now : date).toISOString() }
  })
}

export async function readCollection(name, signal) {
  const stored = readStored(name)
  if (stored) return stored
  const seed = await getJson(name, signal)
  return name === 'orders' ? materializeOrders(seed) : seed
}

export function resetDatabase() {
  ;['events', 'users', 'orders'].forEach((name) => window.localStorage.removeItem(KEY(name)))
}

// Pide las colecciones semilla una vez al iniciar: así pasan por el service
// worker, que las guarda (NetworkFirst) y la app funciona sin conexión incluso
// en pantallas que todavía no se han visitado.
export function warmApiCache() {
  if (!navigator.onLine) return
  ;['events', 'users', 'orders'].forEach((name) => getJson(name).catch(() => {}))
}
