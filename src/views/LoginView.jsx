import { useState } from 'react'
import AuthCard from '../components/AuthCard.jsx'
import Button from '../components/Button.jsx'
import Field from '../components/Field.jsx'
import Link from '../components/Link.jsx'
import Notice from '../components/Notice.jsx'
import { api } from '../api/fakeApi.js'
import { simpleHash } from '../utils/format.js'
import { validateLogin } from '../utils/validation.js'

// Inicio de sesión simulado. Tras entrar vuelve a la pantalla de origen.
export default function LoginView({ users, setSessionId, navigate, simulateError, redirect = 'events' }) {
  const [form, setForm] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (event) => {
    event.preventDefault()
    if (loading) return
    const found = validateLogin(form)
    setErrors(found)
    setFormError('')
    if (Object.keys(found).length > 0) return

    setLoading(true)
    try {
      const user = await api.login(
        users,
        { email: form.email, passwordHash: simpleHash(form.password) },
        { fail: simulateError },
      )
      setSessionId(user.id)
      navigate(redirect)
    } catch (error) {
      setFormError(error.message)
      setLoading(false)
    }
  }

  return (
    <AuthCard
      title="Inicia sesión"
      intro="Accede para comprar boletos y ver los que ya tienes."
      footer={
        <>
          ¿No tienes cuenta? <Link navigate={navigate} to="register" className="inline-link">Regístrate</Link>
        </>
      }
    >
      <form className="form" onSubmit={submit} noValidate>
        {formError && <Notice tone="danger">{formError}</Notice>}
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
          autoComplete="current-password"
          value={form.password}
          error={errors.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        <Button type="submit" block loading={loading}>
          {loading ? 'Entrando…' : 'Iniciar sesión'}
        </Button>
        <Link navigate={navigate} to="recover" className="inline-link auth__recover">
          ¿Olvidaste tu contraseña?
        </Link>
      </form>
    </AuthCard>
  )
}
