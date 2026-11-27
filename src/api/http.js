// Utilidades de red de la API falsa: fetch con AbortController, latencia
// simulada y errores con mensajes comprensibles.

const PREFS_KEY = 'stage.prefs.v3'

export class ApiError extends Error {
  constructor(message, status = 0) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

export const isAbort = (error) => error?.name === 'AbortError'

const abortError = () => new DOMException('La solicitud fue cancelada.', 'AbortError')

// Espera que se puede cancelar con AbortController.
export function wait(ms, signal) {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) return reject(abortError())
    const timer = setTimeout(() => {
      signal?.removeEventListener('abort', onAbort)
      resolve()
    }, ms)
    function onAbort() {
      clearTimeout(timer)
      reject(abortError())
    }
    signal?.addEventListener('abort', onAbort, { once: true })
  })
}

// El interruptor «Simular error de red» del pie guarda su valor en localStorage;
// la API lo lee aquí para fallar igual que lo haría un servidor caído.
export function shouldFail() {
  try {
    return JSON.parse(window.localStorage.getItem(PREFS_KEY))?.simulateError === true
  } catch {
    return false
  }
}

// Latencia + fallo simulado. Se llama al inicio de cada operación de la API.
export async function gate({ signal, ms = 350 } = {}) {
  await wait(ms, signal)
  if (shouldFail()) {
    throw new ApiError('No pudimos conectar con el servidor simulado. Intenta de nuevo.', 503)
  }
}

// Lee un archivo JSON de public/api/ (la «base de datos» semilla).
// El service worker lo atiende con NetworkFirst, así que también carga sin conexión.
export async function getJson(name, signal) {
  let response
  try {
    response = await fetch(`${import.meta.env.BASE_URL}api/${name}.json`, { signal })
  } catch (error) {
    if (isAbort(error)) throw error
    throw new ApiError('Sin conexión y sin datos guardados todavía. Conéctate e inténtalo de nuevo.')
  }
  if (!response.ok) throw new ApiError(`El servidor simulado respondió ${response.status}.`, response.status)
  return response.json()
}
