import { useState } from 'react'
import AuthCard from '../components/AuthCard.jsx'
import Button from '../components/Button.jsx'
import Field from '../components/Field.jsx'
import Link from '../components/Link.jsx'
import Notice from '../components/Notice.jsx'
import { api } from '../api/fakeApi.js'
import { isValidEmail } from '../utils/format.js'

// Recuperación de contraseña simulada: no se envía ningún correo.
export default function RecoverView({ navigate, simulateError }) {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const submit = async (event) => {
    event.preventDefault()
    if (loading) return
    if (!isValidEmail(email.trim())) {
      setError('Escribe un correo válido.')
      return
    }
    setError('')
    setLoading(true)
    try {
      await api.recover(email, { fail: simulateError })
      setSent(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthCard
      title="Recupera tu contraseña"
      intro="Escribe tu correo y te mostraremos cómo continuaría el proceso."
      footer={<Link navigate={navigate} to="login" className="inline-link">← Volver a iniciar sesión</Link>}
    >
      {sent ? (
        <Notice tone="success">
          Si el correo está registrado, recibirías un enlace para restablecer la contraseña. Es una simulación:
          no se envió ningún correo.
        </Notice>
      ) : (
        <form className="form" onSubmit={submit} noValidate>
          <Field
            label="Correo electrónico"
            type="email"
            autoComplete="email"
            value={email}
            error={error}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Button type="submit" block loading={loading}>
            {loading ? 'Enviando…' : 'Enviar instrucciones'}
          </Button>
        </form>
      )}
    </AuthCard>
  )
}
