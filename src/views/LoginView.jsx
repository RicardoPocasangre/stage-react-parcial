import { useEffect, useRef, useState } from 'react'
import { Navigate, useNavigate, useSearchParams } from 'react-router'
import AuthCard from '../components/AuthCard.jsx'
import Button from '../components/Button.jsx'
import Field from '../components/Field.jsx'
import Link from '../components/Link.jsx'
import Notice from '../components/Notice.jsx'
import { api, isAbort } from '../api/index.js'
import { useSession } from '../state/StoreProvider.jsx'
import { validateLogin } from '../utils/validation.js'

// Solo se aceptan rutas internas como destino tras iniciar sesión.
const safeRedirect = (value) => (value && value.startsWith('/') && !value.startsWith('//') ? value : '/')

// Inicio de sesión simulado. Tras entrar vuelve a la pantalla de origen (?redirect=).
export default function LoginView() {
  const [params] = useSearchParams()
  const redirect = safeRedirect(params.get('redirect'))
  const { user, login } = useSession()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [loading, setLoading] = useState(false)
  const controller = useRef(null)

  useEffect(() => () => controller.current?.abort(), [])

  if (user && !loading) return <Navigate to={redirect} replace />

  const submit = async (event) => {
    event.preventDefault()
    if (loading) return
    const found = validateLogin(form)
    setErrors(found)
    setFormError('')
    if (Object.keys(found).length > 0) return

    setLoading(true)
    controller.current = new AbortController()
    try {
      const signedIn = await api.users.login(form, { signal: controller.current.signal })
      login(signedIn)
      navigate(redirect, { replace: true })
    } catch (error) {
      if (isAbort(error)) return
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
          ¿No tienes cuenta? <Link to="/registro" className="inline-link">Regístrate</Link>
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
        <Link to="/recuperar" className="inline-link auth__recover">
          ¿Olvidaste tu contraseña?
        </Link>
      </form>
    </AuthCard>
  )
}
