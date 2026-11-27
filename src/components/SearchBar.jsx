import { asset } from '../utils/assets.js'
import Button from './Button.jsx'

// Buscador controlado con botón «Buscar». El valor vive en el componente
// padre (estado elevado) y el listado se filtra mientras se escribe.
export default function SearchBar({ value, onChange, onSubmit }) {
  return (
    <form className="search" role="search" onSubmit={(e) => {
      e.preventDefault()
      onSubmit?.()
    }}>
      <div className="search__field">
        <label className="visually-hidden" htmlFor="search-input">
          Buscar por evento o recinto
        </label>
        <img className="search__icon" src={asset('img/icon-search-dark.png')} alt="" width="20" height="20" />
        <input
          id="search-input"
          className="search__input"
          type="search"
          placeholder="Buscar por evento o recinto"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete="off"
        />
      </div>
      <Button type="submit">Buscar</Button>
    </form>
  )
}
