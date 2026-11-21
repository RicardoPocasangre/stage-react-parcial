// Chip de filtro: botón conmutable que comunica su estado con aria-pressed.
export default function Chip({ selected = false, onClick, children }) {
  return (
    <button
      type="button"
      className={`chip${selected ? ' is-selected' : ''}`}
      aria-pressed={selected}
      onClick={onClick}
    >
      {children}
    </button>
  )
}
