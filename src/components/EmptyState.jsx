import { asset } from '../utils/assets.js'

// Estado vacío informativo cuando no hay resultados.
export default function EmptyState({ title, children, action }) {
  return (
    <div className="state">
      <img className="state__icon" src={asset('img/icon-ticket.png')} alt="" width="40" height="40" />
      <h2 className="state__title">{title}</h2>
      {children && <p className="state__text">{children}</p>}
      {action}
    </div>
  )
}
