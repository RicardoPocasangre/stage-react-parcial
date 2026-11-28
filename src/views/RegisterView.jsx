import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import AuthCard from '../components/AuthCard.jsx'
import Button from '../components/Button.jsx'
import Field from '../components/Field.jsx'
import Link from '../components/Link.jsx'
import Notice from '../components/Notice.jsx'
import { api, isAbort } from '../api/index.js'
import { useSession } from '../state/StoreProvider.jsx'
import { validateRegister } from '../utils/validation.js'

// Registro simulado: crea una cuenta de cliente en este navegador.
export default function RegisterView() {
  const { login } = useSession()
  const navigate = useNavigate()
  const controller = useRef(null)
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => () => controller.current?.abort(), [])

  const submit = async (event) => {
    event.preventDefault()
    if (loading) return
    const found = validateRegister(form)
    setErrors(found)
    setFormError('')
    if (Object.keys(found).length > 0) return

    setLoading(true)
    controller.current = new AbortController()
    try {
      const user = await api.users.register(form, { signal: controller.current.signal })
      login(user)
      navigate('/', { replace: true })
    } catch (error) {
      if (isAbort(error)) return
      setFormError(error.message)
      setLoading(false)
    }
  }

  return (
    <AuthCard
      title="Crea tu cuenta"
      intro="Es una cuenta de demostración: se guarda solo en este navegador."
      footer={
        <>
          ¿Ya tienes cuenta? <Link to="/login" className="inline-link">Inicia sesión</Link>
        </>
      }
    >
      <form className="form" onSubmit={submit} noValidate>
        {formError && <Notice tone="danger">{formError}</Notice>}
        <Field
          label="Nombre completo"
          autoComplete="name"
          value={form.name}
          error={errors.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <Field
          label="Correo electrónico"
          type="email"
          autoComplete="email"
          value={form.email}
          error={errors.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <Field
          label="Contraseña"
          type="password"
          autoComplete="new-password"
          hint="Mínimo 8 caracteres, con letras y números."
          value={form.password}
          error={errors.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        <Field
          label="Confirmar contraseña"
          type="password"
          autoComplete="new-password"
          value={form.confirm}
          error={errors.confirm}
          onChange={(e) => setForm({ ...form, confirm: e.target.value })}
        />
        <Button type="submit" block loading={loading}>
          {loading ? 'Creando cuenta…' : 'Crear cuenta'}
        </Button>
      </form>
    </AuthCard>
  )
}
