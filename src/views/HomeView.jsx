import { useState } from 'react'
import { useLoaderData, useNavigate } from 'react-router'
import EventCard from '../components/EventCard.jsx'
import Link from '../components/Link.jsx'
import SearchBar from '../components/SearchBar.jsx'
import { CATEGORIES, CATEGORY_LABEL } from '../data/events.js'
import { eventSold } from './admin/stats.js'

// Inicio: buscador, categorías y eventos destacados (los más vendidos).
export default function HomeView() {
  const { events } = useLoaderData()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')

  const featured = events
    .filter((e) => e.status === 'publicado')
    .sort((a, b) => eventSold(b) - eventSold(a))
    .slice(0, 3)

  const search = () => navigate(query.trim() ? `/eventos?q=${encodeURIComponent(query.trim())}` : '/eventos')

  return (
    <>
      <section className="hero" aria-labelledby="hero-title">
        <h1 className="hero__title" id="hero-title">
          Descubre tu próximo evento
        </h1>
        <SearchBar value={query} onChange={setQuery} onSubmit={search} />
      </section>

      <section aria-labelledby="cat-title">
        <h2 className="section-title" id="cat-title">
          Explora por categoría
        </h2>
        <ul className="chips" aria-label="Categorías">
          {CATEGORIES.map((c) => (
            <li key={c}>
              <Link className="chip" to={`/eventos?categoria=${encodeURIComponent(c)}`}>
                {CATEGORY_LABEL[c]}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="featured-title">
        <h2 className="section-title" id="featured-title">
          Eventos destacados
        </h2>
        <ul className="event-grid">
          {featured.map((event) => (
            <li key={event.id}>
              <EventCard event={event} />
            </li>
          ))}
        </ul>
        <p className="back">
          <Link to="/eventos">Ver todos los eventos →</Link>
        </p>
      </section>
    </>
  )
}
