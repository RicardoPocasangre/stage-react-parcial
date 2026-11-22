import { useState } from 'react'
import Button from '../../components/Button.jsx'
import Field from '../../components/Field.jsx'
import Notice from '../../components/Notice.jsx'
import { available } from '../../utils/format.js'

// Inventario y precios por zona. Valida que el precio sea positivo y que la
// capacidad no baje de los boletos ya vendidos.
export default function InventoryTab({ events, setEvents }) {
  const [eventId, setEventId] = useState(events[0]?.id ?? '')
  const [drafts, setDrafts] = useState({})
  const [errors, setErrors] = useState({})
  const [saved, setSaved] = useState(false)
  const event = events.find((e) => e.id === eventId)

  const draft = (zone) => drafts[zone.id] ?? { price: String(zone.price), capacity: String(zone.capacity) }
  const update = (zone, key, value) => {
    setSaved(false)
    setDrafts((prev) => ({ ...prev, [zone.id]: { ...draft(zone), [key]: value } }))
    setErrors((prev) => ({ ...prev, [zone.id]: { ...prev[zone.id], [key]: undefined } }))
  }

  const save = (zone) => {
    const { price, capacity } = draft(zone)
    const found = {}
    if (!(Number(price) > 0)) found.price = 'El precio debe ser mayor que cero.'
    if (!Number.isInteger(Number(capacity)) || Number(capacity) < zone.sold) {
      found.capacity = `La capacidad no puede ser menor que los ${zone.sold} boletos vendidos.`
    }
    setErrors((prev) => ({ ...prev, [zone.id]: found }))
    if (Object.keys(found).length > 0) return

    setEvents((prev) =>
      prev.map((e) =>
        e.id === eventId
          ? { ...e, zones: e.zones.map((z) => (z.id === zone.id ? { ...z, price: Number(price), capacity: Number(capacity) } : z)) }
          : e,
      ),
    )
    setDrafts((prev) => {
      const { [zone.id]: _removed, ...rest } = prev
      return rest
    })
    setSaved(true)
  }

  return (
    <>
      <Field
        as="select"
        label="Evento"
        value={eventId}
        onChange={(e) => {
          setEventId(e.target.value)
          setDrafts({})
          setErrors({})
          setSaved(false)
        }}
      >
        {events.map((e) => (
          <option key={e.id} value={e.id}>{e.title}</option>
        ))}
      </Field>
      {saved && <Notice tone="success" onClose={() => setSaved(false)}>Cambios guardados.</Notice>}
      <ul className="inventory">
        {event?.zones.map((zone) => (
          <li key={zone.id} className="inventory__row">
            <div>
              <p className="inventory__name">{zone.name}</p>
              <p className="inventory__meta">
                {zone.sold} vendidos · {available(zone)} disponibles
              </p>
            </div>
            <Field
              label="Precio (USD)"
              type="number"
              min="0"
              step="0.01"
              value={draft(zone).price}
              error={errors[zone.id]?.price}
              onChange={(e) => update(zone, 'price', e.target.value)}
            />
            <Field
              label="Capacidad"
              type="number"
              min="0"
              step="1"
              value={draft(zone).capacity}
              error={errors[zone.id]?.capacity}
              onChange={(e) => update(zone, 'capacity', e.target.value)}
            />
            <Button variant="secondary" onClick={() => save(zone)}>
              Guardar<span className="visually-hidden"> {zone.name}</span>
            </Button>
          </li>
        ))}
      </ul>
    </>
  )
}
