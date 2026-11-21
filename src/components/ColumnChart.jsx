// Gráfico de columnas construido con HTML y CSS (sin librerías).
// data: [{ label, value }]; format convierte el valor en texto.
export default function ColumnChart({ title, data, format = String }) {
  const max = Math.max(...data.map((d) => d.value), 1)

  return (
    <figure className="columns">
      <figcaption className="columns__title">{title}</figcaption>
      <ul className="columns__list">
        {data.map((d) => (
          <li key={d.label + d.value} className="columns__item" title={`${d.label}: ${format(d.value)}`}>
            <span className="columns__bar" style={{ height: `${Math.max((d.value / max) * 100, 2)}%` }}>
              <span className="visually-hidden">{`${d.label}: ${format(d.value)}`}</span>
            </span>
            <span className="columns__label" aria-hidden="true">{d.label}</span>
          </li>
        ))}
      </ul>
    </figure>
  )
}
