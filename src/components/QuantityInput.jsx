// Selector de cantidad con botones − y +, límites mínimo y máximo.
export default function QuantityInput({ value, min = 1, max = 10, onChange, label = 'Cantidad' }) {
  const dec = () => onChange(Math.max(min, value - 1))
  const inc = () => onChange(Math.min(max, value + 1))

  return (
    <div className="qty" role="group" aria-label={label}>
      <button
        type="button"
        className="qty__btn"
        onClick={dec}
        disabled={value <= min}
        aria-label="Disminuir cantidad"
      >
        −
      </button>
      <output className="qty__value" aria-live="polite">
        {value}
      </output>
      <button
        type="button"
        className="qty__btn"
        onClick={inc}
        disabled={value >= max}
        aria-label="Aumentar cantidad"
      >
        +
      </button>
    </div>
  )
}
