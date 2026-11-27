import { useState } from 'react'
import { useLoaderData, useNavigate } from 'react-router'
import { api, isAbort } from '../api/index.js'
import Badge from '../components/Badge.jsx'
import Button from '../components/Button.jsx'
import Field from '../components/Field.jsx'
import Notice from '../components/Notice.jsx'
import { useSession } from '../state/StoreProvider.jsx'

const ROLE_LABEL = { cliente: 'Cliente', administrador: 'Administrador', organizador: 'Organizador' }

const splitName = (name) => {
  const [first = '', ...rest] = name.trim().split(/\s+/)
  return { first, last: rest.join(' ') }
}

// Perfil con menú lateral (Datos personales, Seguridad, Mis boletos, Cerrar sesión).
// La ruta está protegida: siempre hay un usuario en sesión.
export default function ProfileView() {
  const { orders } = useLoaderData()
  const { user, logout } = useSession()
  const navigate = useNavigate()
  const [section, setSection] = useState('datos')

  const mine = orders.filter((o) => o.userId === user.id)
  const spent = mine.reduce((sum, o) => sum + o.total, 0)

  return (
    <section className="profile" aria-labelledby="profile-title">
      <h1 className="page-title" id="profile-title">Mi perfil</h1>
      <div className="profile__grid">
        <nav className="profile__menu" aria-label="Secciones del perfil">
          <ul>
            <li>
              <button type="button" className="profile__link" aria-current={section === 'datos' ? 'page' : undefined} onClick={() => setSection('datos')}>
                Datos personales
              </button>
            </li>
            <li>
              <button type="button" className="profile__link" aria-current={section === 'seguridad' ? 'page' : undefined} onClick={() => setSection('seguridad')}>
                Seguridad
              </button>
            </li>
            <li>
              <button type="button" className="profile__link" onClick={() => navigate('/boletos')}>
                Mis boletos
              </button>
            </li>
            <li>
              <button type="button" className="profile__link" onClick={() => {
                  logout()
                  navigate('/')
                }}>
                Cerrar sesión
              </button>
            </li>
          </ul>
          <p className="profile__stats">
            {mine.length} {mine.length === 1 ? 'orden' : 'órdenes'} · ${spent.toFixed(2)} en total
          </p>
        </nav>

        {section === 'datos' ? (
          <PersonalForm user={user} />
        ) : (
          <SecurityForm user={user} />
        )}
      </div>
    </section>
  )
}

function PersonalForm({ user }) {
  const { updateUser } = useSession()
  const initial = splitName(user.name)
  const [form, setForm] = useState({ first: initial.first, last: initial.last, phone: user.phone ?? '' })
  const [errors, setErrors] = useState({})
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)
  const [apiError, setApiError] = useState('')

  const update = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => ({ ...prev, [key]: undefined }))
    setSaved(false)
  }

  const submit = async (event) => {
    event.preventDefault()
    const found = {}
    if (form.first.trim().length < 2) found.first = 'Escribe tu nombre.'
    if (form.last.trim().length < 2) found.last = 'Escribe tu apellido.'
    if (form.phone.trim() && !/^[0-9+() -]{8,20}$/.test(form.phone.trim())) {
      found.phone = 'El teléfono solo admite números, espacios, + y guiones (8 a 20 caracteres).'
    }
    setErrors(found)
    if (Object.keys(found).length > 0) return

    setSaving(true)
    setApiError('')
    try {
      const patch = { name: `${form.first.trim()} ${form.last.trim()}`, phone: form.phone.trim() }
      await api.users.updateProfile(user.id, patch)
      updateUser(patch)
      setSaved(true)
    } catch (error) {
      if (!isAbort(error)) setApiError(error.message)
    } finally {
      setSaving(false)
    }
  }

  const cancel = () => {
    setForm({ first: initial.first, last: initial.last, phone: user.phone ?? '' })
    setErrors({})
    setSaved(false)
  }

  return (
    <form className="form" onSubmit={submit} noValidate>
      <h2 className="form__title">Datos personales</h2>
      {saved && <Notice tone="success" onClose={() => setSaved(false)}>Guardamos tus cambios.</Notice>}
      {apiError && <Notice tone="danger">{apiError}</Notice>}
      <div className="form__row">
        <Field label="Nombre" value={form.first} error={errors.first} autoComplete="given-name" onChange={(e) => update('first', e.target.value)} />
        <Field label="Apellido" value={form.last} error={errors.last} autoComplete="family-name" onChange={(e) => update('last', e.target.value)} />
      </div>
      <div className="form__row">
        <Field label="Correo electrónico" value={user.email} readOnly hint="El correo no se puede cambiar." />
        <Field label="Teléfono" type="tel" value={form.phone} error={errors.phone} placeholder="0000-0000" autoComplete="tel" onChange={(e) => update('phone', e.target.value)} />
      </div>
      <p className="profile__role">
        Tipo de cuenta <Badge tone="success">{ROLE_LABEL[user.role]}</Badge>
      </p>
      <div className="form__actions">
        <Button variant="ghost" onClick={cancel}>Cancelar</Button>
        <Button type="submit" loading={saving}>Guardar cambios</Button>
      </div>
    </form>
  )
}

function SecurityForm({ user }) {
  const [form, setForm] = useState({ current: '', next: '', confirm: '' })
  const [errors, setErrors] = useState({})
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)

  const update = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => ({ ...prev, [key]: undefined }))
    setSaved(false)
  }

  const submit = async (event) => {
    event.preventDefault()
    const found = {}
    if (!form.current) found.current = 'Escribe tu contraseña actual.'
    if (form.next.length < 8 || !/\d/.test(form.next) || !/[A-Za-z]/.test(form.next)) {
      found.next = 'La contraseña debe tener al menos 8 caracteres, con letras y números.'
    }
    if (form.confirm !== form.next) found.confirm = 'Las contraseñas no coinciden.'
    setErrors(found)
    if (Object.keys(found).length > 0) return

    setSaving(true)
    try {
      await api.users.changePassword(user.id, { current: form.current, next: form.next })
      setForm({ current: '', next: '', confirm: '' })
      setSaved(true)
    } catch (error) {
      if (!isAbort(error)) setErrors({ current: error.message })
    } finally {
      setSaving(false)
    }
  }

  return (
    <form className="form" onSubmit={submit} noValidate>
      <h2 className="form__title">Seguridad</h2>
      {saved && <Notice tone="success" onClose={() => setSaved(false)}>Actualizamos tu contraseña.</Notice>}
      <Field label="Contraseña actual" type="password" autoComplete="current-password" value={form.current} error={errors.current} onChange={(e) => update('current', e.target.value)} />
      <Field label="Nueva contraseña" type="password" autoComplete="new-password" hint="Mínimo 8 caracteres, con letras y números." value={form.next} error={errors.next} onChange={(e) => update('next', e.target.value)} />
      <Field label="Confirmar nueva contraseña" type="password" autoComplete="new-password" value={form.confirm} error={errors.confirm} onChange={(e) => update('confirm', e.target.value)} />
      <div className="form__actions">
        <Button type="submit" loading={saving}>Actualizar contraseña</Button>
      </div>
    </form>
  )
}
