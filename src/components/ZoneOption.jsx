import { available, formatMoney } from '../utils/format.js'

// Zona seleccionable (radio accesible) con precio y disponibilidad.
export default function ZoneOption({ zone, selected, onSelect, disabled }) {
  const left = available(zone)
  const soldOut = left === 0

  return (
    <label className={`zone${selected ? ' is-selected' : ''}${soldOut || disabled ? ' is-disabled' : ''}`}>
      <input
        className="zone__radio"
        type="radio"
        name="zone"
        value={zone.id}
        checked={selected}
        disabled={soldOut || disabled}
        onChange={() => onSelect(zone.id)}
      />
      <span className="zone__info">
        <span className="zone__name">{zone.name}</span>
        <span className="zone__desc">{zone.desc}</span>
      </span>
      <span className="zone__stock">{soldOut ? 'Agotada' : `${left} disponibles`}</span>
      <span className="zone__price">{formatMoney(zone.price)}</span>
    </label>
  )
}
