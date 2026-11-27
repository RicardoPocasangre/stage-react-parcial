import { usePrefs } from '../state/StoreProvider.jsx'
import InstallButton from './InstallButton.jsx'

// Pie de página. Incluye un interruptor para simular fallos de red (así se
// demuestran los estados de error de la API) y el botón de instalar la PWA.
export default function Footer() {
  const { simulateError, setSimulateError } = usePrefs()

  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <p className="site-footer__brand">STAGE · Sistema de venta de boletos</p>
        <label className="site-footer__toggle">
          <input type="checkbox" checked={simulateError} onChange={(e) => setSimulateError(e.target.checked)} />
          Simular error de red
        </label>
        <InstallButton />
        <p>© 2026 STAGE · Proyecto académico</p>
      </div>
    </footer>
  )
}
