import { useMemo } from 'react'
import Button from '../components/Button.jsx'
import Chip from '../components/Chip.jsx'
import EmptyState from '../components/EmptyState.jsx'
import ErrorState from '../components/ErrorState.jsx'
import EventCard from '../components/EventCard.jsx'
import LoadingState from '../components/LoadingState.jsx'
import SearchBar from '../components/SearchBar.jsx'
import { CATEGORIES, CATEGORY_LABEL } from '../data/events.js'
import { useAsync } from '../hooks/useAsync.js'
import { api } from '../api/fakeApi.js'
import { minPrice } from '../utils/format.js'

const normalize = (text) =>
  text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

const SORTS = {
  fecha: { label: 'Fecha más próxima', compare: (a, b) => new Date(a.date) - new Date(b.date) },
  precio: { label: 'Precio más bajo', compare: (a, b) => minPrice(a) - minPrice(b) },
  nombre: { label: 'Nombre (A–Z)', compare: (a, b) => a.title.localeCompare(b.title, 'es') },
}

// Listado, búsqueda y filtros. El estado de los filtros se eleva a App.
export default function EventsView({ events, filters, setFilters, navigate, simulateError }) {
  const { status, data, error, retry } = useAsync(
    () => api.getEvents(events, { fail: simulateError }),
    [events, simulateError],
  )

  const visible = useMemo(() => {
    if (!data) return []
    const query = normalize(filters.query.trim())
    return data
      .filter((e) => e.status !== 'borrador')
      .filter((e) => !filters.category || e.category === filters.category)
      .filter(
        (e) =>
          !query ||
          normalize(`${e.title} ${e.venue} ${e.city} ${e.category}`).includes(query),
      )
      .sort(SORTS[filters.sort].compare)
  }, [data, filters])

  const resetFilters = () => setFilters((prev) => ({ ...prev, query: '', category: '' }))

  return (
    <>
      <section className="hero" aria-labelledby="hero-title">
        <h1 className="hero__title" id="hero-title">
          Descubre tu próximo evento
        </h1>
        <SearchBar value={filters.query} onChange={(query) => setFilters((p) => ({ ...p, query }))} />
      </section>

      <section aria-labelledby="events-title" aria-busy={status === 'loading'}>
        <div className="toolbar">
          <div className="chips" role="group" aria-label="Filtrar por categoría">
            <Chip selected={!filters.category} onClick={resetFilters}>
              Todos
            </Chip>
            {CATEGORIES.map((c) => (
              <Chip
                key={c}
                selected={filters.category === c}
                onClick={() => setFilters((prev) => ({ ...prev, category: prev.category === c ? '' : c }))}
              >
                {CATEGORY_LABEL[c]}
              </Chip>
            ))}
          </div>
          <label className="sort">
            <span className="sort__label">Ordenar:</span>
            <select
              className="sort__select"
              value={filters.sort}
              onChange={(e) => setFilters((prev) => ({ ...prev, sort: e.target.value }))}
            >
              {Object.entries(SORTS).map(([key, s]) => (
                <option key={key} value={key}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <h2 className="section-title" id="events-title">
          Próximos eventos
        </h2>

        {status === 'loading' && <LoadingState label="Cargando eventos…" />}
        {status === 'error' && <ErrorState message={error.message} onRetry={retry} />}
        {status === 'success' && visible.length === 0 && (
          <EmptyState
            title="No encontramos eventos"
            action={<Button onClick={resetFilters}>Ver todos los eventos</Button>}
          >
            Prueba con otra palabra o quita los filtros para ver más resultados.
          </EmptyState>
        )}
        {status === 'success' && visible.length > 0 && (
          <>
            <p className="results-count" role="status">
              {visible.length} {visible.length === 1 ? 'evento' : 'eventos'}
            </p>
            <ul className="event-grid">
              {visible.map((event) => (
                <li key={event.id}>
                  <EventCard event={event} navigate={navigate} />
                </li>
              ))}
            </ul>
          </>
        )}
      </section>
    </>
  )
}
