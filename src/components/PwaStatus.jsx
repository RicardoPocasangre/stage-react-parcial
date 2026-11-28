import { useEffect, useState } from 'react'
import { useRegisterSW } from 'virtual:pwa-register/react'
import Button from './Button.jsx'

// Avisos de la PWA: app lista sin conexión, nueva versión disponible y
// estado de la conexión del navegador.
export default function PwaStatus() {
  const [online, setOnline] = useState(() => navigator.onLine)
  const [offlineReadyDismissed, setOfflineReadyDismissed] = useState(false)
  const {
    offlineReady: [offlineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW()

  useEffect(() => {
    const on = () => setOnline(true)
    const off = () => setOnline(false)
    window.addEventListener('online', on)
    window.addEventListener('offline', off)
    return () => {
      window.removeEventListener('online', on)
      window.removeEventListener('offline', off)
    }
  }, [])

  return (
    <>
      {!online && (
        <p className="offline-banner" role="status">
          Sin conexión: verás los datos que ya visitaste. Las compras y cambios se guardan en este navegador.
        </p>
      )}
      {(needRefresh || (offlineReady && !offlineReadyDismissed)) && (
        <div className="pwa-toast" role="status" aria-live="polite">
          <p className="pwa-toast__text">
            {needRefresh
              ? 'Hay una nueva versión de STAGE disponible.'
              : 'STAGE ya está lista para usarse sin conexión.'}
          </p>
          <div className="pwa-toast__actions">
            {needRefresh && <Button size="sm" onClick={() => updateServiceWorker(true)}>Actualizar</Button>}
            <Button
              size="sm"
              variant="ghost"
              onClick={() => (needRefresh ? setNeedRefresh(false) : setOfflineReadyDismissed(true))}
            >
              Cerrar
            </Button>
          </div>
        </div>
      )}
    </>
  )
}
