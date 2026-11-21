// Pie de página. Incluye un interruptor para simular fallos de red y así
// poder demostrar los estados de error de las operaciones asíncronas.
export default function Footer({ simulateError, onToggleError }) {
  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <p className="site-footer__brand">STAGE · Sistema de venta de boletos</p>
        <label className="site-footer__toggle">
          <input type="checkbox" checked={simulateError} onChange={(e) => onToggleError(e.target.checked)} />
          Simular error de red
        </label>
        <p>© 2026 STAGE · Proyecto académico</p>
      </div>
    </footer>
  )
}
