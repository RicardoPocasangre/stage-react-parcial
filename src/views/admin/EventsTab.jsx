import { useState } from 'react'
import Badge from '../../components/Badge.jsx'
import Button from '../../components/Button.jsx'
import Field from '../../components/Field.jsx'
import Notice from '../../components/Notice.jsx'
import { CATEGORIES } from '../../data/events.js'
import { formatDateShort, makeId } from '../../utils/format.js'

const STATUS_TONE = { publicado: 'success', agotado: 'danger', borrador: 'warning', finalizado: 'neutral' }
const EMPTY = { title: '', category: CATEGORIES[0], date: '', venue: '', price: '', capacity: '' }

function validate(f) {
  const errors = {}
  if (f.title.trim().length < 3) errors.title = 'El nombre debe tener al menos 3 caracteres.'
  if (!f.date || new Date(f.date) <= new Date()) errors.date = 'Elige una fecha y hora futuras.'
  if (f.venue.trim().length < 3) errors.venue = 'Escribe el recinto.'
  if (!(Number(f.price) > 0)) errors.price = 'El precio debe ser mayor que cero.'
  if (!Number.isInteger(Number(f.capacity)) || Number(f.capacity) < 1) {
    errors.capacity = 'La capacidad debe ser un número entero positivo.'
  }
  return errors
}

// Listado de eventos con publicar, despublicar, finalizar y creación de eventos nuevos.
export default function EventsTab({ events, setEvents, creating, onCloseCreate }) {
  const [form, setForm] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [created, setCreated] = useState('')

  const setStatus = (id, status) =>
    setEvents((prev) => prev.map((e) => (e.id === id ? { ...e, status } : e)))

  const update = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => ({ ...prev, [key]: undefined }))
  }

  const submit = (event) => {
    event.preventDefault()
    const found = validate(form)
    setErrors(found)
    if (Object.keys(found).length > 0) return

    setEvents((prev) => [
      ...prev,
      {
        id: makeId('ev'),
        title: form.title.trim(),
        category: form.category,
        status: 'borrador',
        date: form.date,
        doors: 'Por confirmar',
        venue: form.venue.trim(),
        city: 'San Salvador',
        description: 'Evento creado desde el panel de administración.',
        zones: [
          {
            id: makeId('z'),
            name: 'General',
            desc: 'Acceso general',
            price: Number(form.price),
            capacity: Number(form.capacity),
            sold: 0,
          },
        ],
      },
    ])
    setCreated(`Creamos «${form.title.trim()}» como borrador. Publícalo cuando esté listo.`)
    setForm(EMPTY)
    onCloseCreate()
  }

  return (
    <>
      {created && <Notice tone="success" onClose={() => setCreated('')}>{created}</Notice>}

      {creating && (
        <form className="form" onSubmit={submit} noValidate>
          <h2 className="form__title">Crear evento</h2>
          <Field label="Nombre del evento" value={form.title} error={errors.title} onChange={(e) => update('title', e.target.value)} />
          <div className="form__row">
            <Field as="select" label="Categoría" value={form.category} onChange={(e) => update('category', e.target.value)}>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </Field>
            <Field label="Fecha y hora" type="datetime-local" value={form.date} error={errors.date} onChange={(e) => update('date', e.target.value)} />
          </div>
          <Field label="Recinto" value={form.venue} error={errors.venue} onChange={(e) => update('venue', e.target.value)} />
          <div className="form__row">
            <Field label="Precio general (USD)" type="number" min="0" step="0.01" value={form.price} error={errors.price} onChange={(e) => update('price', e.target.value)} />
            <Field label="Capacidad" type="number" min="1" step="1" value={form.capacity} error={errors.capacity} onChange={(e) => update('capacity', e.target.value)} />
          </div>
          <div className="form__actions">
            <Button variant="ghost" onClick={onCloseCreate}>Cancelar</Button>
            <Button type="submit">Guardar evento</Button>
          </div>
        </form>
      )}

      <div className="table-wrap">
        <table className="table">
          <caption className="visually-hidden">Listado de eventos</caption>
          <thead>
            <tr>
              <th scope="col">Evento</th>
              <th scope="col">Categoría</th>
              <th scope="col">Fecha</th>
              <th scope="col">Estado</th>
              <th scope="col">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {events.map((e) => (
              <tr key={e.id}>
                <td>{e.title}</td>
                <td>{e.category}</td>
                <td>{formatDateShort(e.date)}</td>
                <td><Badge tone={STATUS_TONE[e.status]}>{e.status}</Badge></td>
                <td className="table__actions">
                  {e.status === 'publicado' && (
                    <Button size="sm" variant="secondary" onClick={() => setStatus(e.id, 'borrador')}>
                      Despublicar<span className="visually-hidden"> {e.title}</span>
                    </Button>
                  )}
                  {e.status === 'borrador' && (
                    <Button size="sm" onClick={() => setStatus(e.id, 'publicado')}>
                      Publicar<span className="visually-hidden"> {e.title}</span>
                    </Button>
                  )}
                  {(e.status === 'publicado' || e.status === 'agotado') && (
                    <Button size="sm" variant="ghost" onClick={() => setStatus(e.id, 'finalizado')}>
                      Finalizar<span className="visually-hidden"> {e.title}</span>
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
