import { useState } from 'react'
import { useLoaderData, useRevalidator, useSearchParams } from 'react-router'
import { api, isAbort } from '../../api/index.js'
import Badge from '../../components/Badge.jsx'
import Button from '../../components/Button.jsx'
import EmptyState from '../../components/EmptyState.jsx'
import Field from '../../components/Field.jsx'
import Notice from '../../components/Notice.jsx'
import { CATEGORIES } from '../../data/events.js'
import { formatDateShort, makeId } from '../../utils/format.js'

const STATUS_TONE = { publicado: 'success', agotado: 'danger', borrador: 'warning', finalizado: 'neutral' }
const STATUSES = ['borrador', 'publicado', 'agotado', 'finalizado']
const EMPTY = {
  title: '',
  category: CATEGORIES[0],
  date: '',
  venue: '',
  city: 'San Salvador',
  description: '',
  status: 'borrador',
  price: '',
  capacity: '',
}

// <input type="datetime-local"> espera «AAAA-MM-DDTHH:mm».
const toLocalInput = (iso) => iso.slice(0, 16)

function validate(f, { creating }) {
  const errors = {}
  if (f.title.trim().length < 3) errors.title = 'El nombre debe tener al menos 3 caracteres.'
  if (!f.date || Number.isNaN(new Date(f.date).getTime())) errors.date = 'Elige una fecha y hora válidas.'
  else if (creating && new Date(f.date) <= new Date()) errors.date = 'Elige una fecha y hora futuras.'
  if (f.venue.trim().length < 3) errors.venue = 'Escribe el recinto.'
  if (f.city.trim().length < 2) errors.city = 'Escribe la ciudad.'
  if (creating) {
    if (!(Number(f.price) > 0)) errors.price = 'El precio debe ser mayor que cero.'
    if (!Number.isInteger(Number(f.capacity)) || Number(f.capacity) < 1) {
      errors.capacity = 'La capacidad debe ser un número entero positivo.'
    }
  }
  return errors
}

// CRUD de eventos: listar, crear, editar, publicar/despublicar/finalizar y eliminar.
// Las mutaciones pasan por la API falsa y después se revalidan los datos del loader.
export default function EventsTab() {
  const { events } = useLoaderData()
  const { revalidate } = useRevalidator()
  const [params, setParams] = useSearchParams()
  const [editingId, setEditingId] = useState(null) // id del evento en edición
  const [form, setForm] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [notice, setNotice] = useState(null)
  const [confirmId, setConfirmId] = useState(null)
  const [saving, setSaving] = useState(false)

  const creating = params.get('nuevo') === '1'
  const formOpen = creating || editingId !== null

  const closeForm = () => {
    setEditingId(null)
    setForm(EMPTY)
    setErrors({})
    if (creating) setParams({}, { replace: true })
  }

  const openCreate = () => {
    setEditingId(null)
    setForm(EMPTY)
    setParams({ nuevo: '1' }, { replace: true })
  }

  const openEdit = (event) => {
    setParams({}, { replace: true })
    setEditingId(event.id)
    setErrors({})
    setForm({
      title: event.title,
      category: event.category,
      date: toLocalInput(event.date),
      venue: event.venue,
      city: event.city,
      description: event.description,
      status: event.status,
      price: '',
      capacity: '',
    })
  }

  const update = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => ({ ...prev, [key]: undefined }))
  }

  const run = async (task, message) => {
    setSaving(true)
    try {
      await task()
      setNotice({ tone: 'success', text: message })
      revalidate()
    } catch (error) {
      if (!isAbort(error)) setNotice({ tone: 'danger', text: error.message })
    } finally {
      setSaving(false)
    }
  }

  const submit = async (event) => {
    event.preventDefault()
    const found = validate(form, { creating: editingId === null })
    setErrors(found)
    if (Object.keys(found).length > 0) return

    const base = {
      title: form.title.trim(),
      category: form.category,
      date: form.date,
      venue: form.venue.trim(),
      city: form.city.trim(),
      description: form.description.trim() || 'Evento creado desde el panel de administración.',
    }
    if (editingId) {
      await run(() => api.events.update(editingId, { ...base, status: form.status }), `Actualizamos «${base.title}».`)
    } else {
      const zone = {
        id: makeId('z'),
        name: 'General',
        desc: 'Acceso general',
        price: Number(form.price),
        capacity: Number(form.capacity),
        sold: 0,
      }
      await run(
        () => api.events.create({ ...base, zones: [zone] }),
        `Creamos «${base.title}» como borrador. Publícalo cuando esté listo.`,
      )
    }
    closeForm()
  }

  const setStatus = (event, status) =>
    run(() => api.events.update(event.id, { status }), `«${event.title}» ahora está ${status}.`)

  const remove = async (event) => {
    setConfirmId(null)
    await run(() => api.events.remove(event.id), `Eliminamos «${event.title}».`)
  }

  return (
    <>
      {notice && (
        <Notice tone={notice.tone} onClose={() => setNotice(null)}>
          {notice.text}
        </Notice>
      )}

      {formOpen ? (
        <form className="form" onSubmit={submit} noValidate>
          <h2 className="form__title">{editingId ? 'Editar evento' : 'Crear evento'}</h2>
          <Field label="Nombre del evento" value={form.title} error={errors.title} onChange={(e) => update('title', e.target.value)} />
          <div className="form__row">
            <Field as="select" label="Categoría" value={form.category} onChange={(e) => update('category', e.target.value)}>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </Field>
            <Field label="Fecha y hora" type="datetime-local" value={form.date} error={errors.date} onChange={(e) => update('date', e.target.value)} />
          </div>
          <div className="form__row">
            <Field label="Recinto" value={form.venue} error={errors.venue} onChange={(e) => update('venue', e.target.value)} />
            <Field label="Ciudad" value={form.city} error={errors.city} onChange={(e) => update('city', e.target.value)} />
          </div>
          <Field as="textarea" label="Descripción" rows={3} value={form.description} onChange={(e) => update('description', e.target.value)} />
          {editingId ? (
            <Field as="select" label="Estado" value={form.status} onChange={(e) => update('status', e.target.value)}>
              {STATUSES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </Field>
          ) : (
            <div className="form__row">
              <Field label="Precio general (USD)" type="number" min="0" step="0.01" value={form.price} error={errors.price} onChange={(e) => update('price', e.target.value)} />
              <Field label="Capacidad" type="number" min="1" step="1" value={form.capacity} error={errors.capacity} onChange={(e) => update('capacity', e.target.value)} />
            </div>
          )}
          <div className="form__actions">
            <Button variant="ghost" onClick={closeForm} disabled={saving}>Cancelar</Button>
            <Button type="submit" loading={saving}>{editingId ? 'Guardar cambios' : 'Guardar evento'}</Button>
          </div>
        </form>
      ) : (
        <div className="form__actions">
          <Button variant="secondary" onClick={openCreate}>Nuevo evento</Button>
        </div>
      )}

      {events.length === 0 ? (
        <EmptyState title="No hay eventos">Crea el primero con el botón «Crear evento».</EmptyState>
      ) : (
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
                    {confirmId === e.id ? (
                      <>
                        <span className="table__confirm" role="alert">¿Eliminar «{e.title}»?</span>
                        <Button size="sm" variant="danger" onClick={() => remove(e)}>Sí, eliminar</Button>
                        <Button size="sm" variant="ghost" onClick={() => setConfirmId(null)}>No</Button>
                      </>
                    ) : (
                      <>
                        {e.status === 'publicado' && (
                          <Button size="sm" variant="secondary" disabled={saving} onClick={() => setStatus(e, 'borrador')}>
                            Despublicar<span className="visually-hidden"> {e.title}</span>
                          </Button>
                        )}
                        {e.status === 'borrador' && (
                          <Button size="sm" disabled={saving} onClick={() => setStatus(e, 'publicado')}>
                            Publicar<span className="visually-hidden"> {e.title}</span>
                          </Button>
                        )}
                        {(e.status === 'publicado' || e.status === 'agotado') && (
                          <Button size="sm" variant="ghost" disabled={saving} onClick={() => setStatus(e, 'finalizado')}>
                            Finalizar<span className="visually-hidden"> {e.title}</span>
                          </Button>
                        )}
                        <Button size="sm" variant="secondary" onClick={() => openEdit(e)}>
                          Editar<span className="visually-hidden"> {e.title}</span>
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setConfirmId(e.id)}>
                          Eliminar<span className="visually-hidden"> {e.title}</span>
                        </Button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}
