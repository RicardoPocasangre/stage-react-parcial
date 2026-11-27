// Lectura/escritura síncrona de la sesión en localStorage. La usan el
// StoreProvider y los loaders del router (que se ejecutan fuera de React).
export const SESSION_KEY = 'stage.session.v3'

export function readSession() {
  try {
    const raw = window.localStorage.getItem(SESSION_KEY)
    return raw === null ? null : JSON.parse(raw)
  } catch {
    return null
  }
}

export function writeSession(user) {
  try {
    window.localStorage.setItem(SESSION_KEY, JSON.stringify(user))
  } catch {
    // Sin almacenamiento disponible la sesión solo vive en memoria.
  }
}
