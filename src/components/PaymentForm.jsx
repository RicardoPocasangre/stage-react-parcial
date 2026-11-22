import Field from './Field.jsx'
import Notice from './Notice.jsx'
import { formatCardNumber, formatExpiry } from '../utils/validation.js'

// Formulario de «Método de pago» (simulado). Es controlado: el estado vive en
// CartView. El botón de pago está en el resumen y envía este formulario por id.
export default function PaymentForm({ card, errors, payError, onChange, onSubmit }) {
  return (
    <form
      className="form"
      id="payment-form"
      noValidate
      onSubmit={(e) => {
        e.preventDefault()
        onSubmit()
      }}
    >
      <h2 className="form__title">Método de pago</h2>
      <p className="pay-method">Tarjeta de crédito o débito</p>
      <Notice tone="info">
        No se realiza ningún cobro real. Usa la tarjeta de prueba 4242 4242 4242 4242; una tarjeta terminada
        en 0000 simula un rechazo.
      </Notice>
      {payError && <Notice tone="danger">{payError}</Notice>}
      <Field
        label="Número de tarjeta"
        inputMode="numeric"
        value={card.number}
        error={errors.number}
        autoComplete="cc-number"
        placeholder="0000 0000 0000 0000"
        onChange={(e) => onChange('number', formatCardNumber(e.target.value))}
      />
      <Field
        label="Nombre del titular"
        value={card.holder}
        error={errors.holder}
        autoComplete="cc-name"
        placeholder="Nombre como aparece en la tarjeta"
        onChange={(e) => onChange('holder', e.target.value)}
      />
      <div className="form__row">
        <Field
          label="Vencimiento"
          inputMode="numeric"
          value={card.expiry}
          error={errors.expiry}
          autoComplete="cc-exp"
          placeholder="MM/AA"
          onChange={(e) => onChange('expiry', formatExpiry(e.target.value))}
        />
        <Field
          label="Código de seguridad"
          inputMode="numeric"
          value={card.cvv}
          error={errors.cvv}
          autoComplete="cc-csc"
          placeholder="000"
          maxLength={4}
          onChange={(e) => onChange('cvv', e.target.value.replace(/\D/g, ''))}
        />
      </div>
      <Field
        label="Correo para recibir tus boletos"
        type="email"
        value={card.email}
        error={errors.email}
        hint="Enviaremos aquí tus boletos con su código QR."
        autoComplete="email"
        placeholder="correo@ejemplo.com"
        onChange={(e) => onChange('email', e.target.value)}
      />
    </form>
  )
}
