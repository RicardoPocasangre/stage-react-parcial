import { useMemo } from 'react'
import { useLoaderData, useSearchParams } from 'react-router'
import Button from '../components/Button.jsx'
import Chip from '../components/Chip.jsx'
import EmptyState from '../components/EmptyState.jsx'
import EventCard from '../components/EventCard.jsx'
import SearchBar from '../components/SearchBar.jsx'
import { CATEGORIES, CATEGORY_LABEL } from '../data/events.js'
import { minPrice } from '../utils/format.js'

const normalize = (text) => text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

const SORTS = {
  fecha: { label: 'Fecha más próxima', compare: (a, b) => new Date(a.date) - new Date(b.date) },
  precio: { label: 'Precio más bajo', compare: (a, b) => minPrice(a) - minPrice(b) },
  nombre: { label: 'Nombre (A–Z)', compare: (a, b) => a.title.localeCompare(b.title, 'es') },
}

// Listado, búsqueda y filtros. Los filtros viven en la URL (?q=&categoria=&orden=),
// así se pueden compartir y sobreviven a recargar la página.
export default function EventsView() {
  const { events } = useLoaderData()
  const [params, setParams] = useSearchParams()
  const query = params.get('q') ?? ''
  const category = params.get('categoria') ?? ''
  const sort = SORTS[params.get('orden')] ? params.get('orden') : 'fecha'

  const update = (key, value) =>
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        if (value) next.set(key, value)
        else next.delete(key)
        return next
      },
      { replace: true },
    )

  const visible = useMemo(() => {
    const q = normalize(query.trim())
    return events
      .filter((e) => e.status !== 'borrador')
      .filter((e) => !category || e.category === category)
      .filter((e) => !q || normalize(`${e.title} ${e.venue} ${e.city} ${e.category}`).includes(q))
      .sort(SORTS[sort].compare)
  }, [events, query, category, sort])

  const reset = () => setParams({}, { replace: true })

  return (
    <>
      <section className="hero" aria-labelledby="hero-title">
        <h1 className="hero__title" id="hero-title">
          Eventos
        </h1>
        <SearchBar value={query} onChange={(value) => update('q', value)} />
      </section>

      <section aria-labelledby="events-title">
        <div className="toolbar">
          <div className="chips" role="group" aria-label="Filtrar por categoría">
            <Chip selected={!category} onClick={() => update('categoria', '')}>
              Todos
            </Chip>
            {CATEGORIES.map((c) => (
              <Chip key={c} selected={category === c} onClick={() => update('categoria', category === c ? '' : c)}>
                {CATEGORY_LABEL[c]}
              </Chip>
            ))}
          </div>
          <label className="sort">
            <span className="sort__label">Ordenar:</span>
            <select className="sort__select" value={sort} onChange={(e) => update('orden', e.target.value)}>
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

        {visible.length === 0 ? (
          <EmptyState title="No encontramos eventos" action={<Button onClick={reset}>Ver todos los eventos</Button>}>
            Prueba con otra palabra o quita los filtros para ver más resultados.
          </EmptyState>
        ) : (
          <>
            <p className="results-count" role="status">
              {visible.length} {visible.length === 1 ? 'evento' : 'eventos'}
            </p>
            <ul className="event-grid">
              {visible.map((event) => (
                <li key={event.id}>
                  <EventCard event={event} />
                </li>
              ))}
            </ul>
          </>
        )}
      </section>
    </>
  )
}
