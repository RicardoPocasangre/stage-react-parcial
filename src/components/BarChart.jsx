// Gráfico de barras horizontal construido con HTML y CSS (sin librerías).
// data: [{ label, value }]; format convierte el valor en texto.
export default function BarChart({ title, data, format = String }) {
  const max = Math.max(...data.map((d) => d.value), 1)

  return (
    <figure className="chart">
      <figcaption className="chart__title">{title}</figcaption>
      <ul className="chart__list">
        {data.map((d) => (
          <li key={d.label} className="chart__row">
            <span className="chart__label">{d.label}</span>
            <span className="chart__track" aria-hidden="true">
              <span className="chart__bar" style={{ width: `${(d.value / max) * 100}%` }} />
            </span>
            <span className="chart__value">{format(d.value)}</span>
          </li>
        ))}
      </ul>
    </figure>
  )
}
