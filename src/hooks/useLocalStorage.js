import { useEffect, useState } from 'react'

// Estado persistente: se inicializa desde localStorage y se guarda en cada cambio.
export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const stored = window.localStorage.getItem(key)
      return stored === null ? initialValue : JSON.parse(stored)
    } catch {
      return initialValue
    }
  })

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // Si el almacenamiento no está disponible, la app sigue funcionando en memoria.
    }
  }, [key, value])

  return [value, setValue]
}
