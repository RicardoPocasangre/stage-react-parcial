import { useId } from 'react'

// Campo controlado con etiqueta asociada, ayuda y mensaje de error accesible.
export default function Field({ label, error, hint, as = 'input', onChange, children, ...rest }) {
  const id = useId()
  const errorId = `${id}-error`
  const hintId = `${id}-hint`
  const describedBy = [error ? errorId : null, hint ? hintId : null].filter(Boolean).join(' ')
  const Control = as

  return (
    <div className={`field${error ? ' has-error' : ''}`}>
      <label className="field__label" htmlFor={id}>
        {label}
      </label>
      <Control
        id={id}
        className="field__control"
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={describedBy || undefined}
        onChange={onChange}
        {...rest}
      >
        {children}
      </Control>
      {hint && !error && (
        <p className="field__hint" id={hintId}>
          {hint}
        </p>
      )}
      {error && (
        <p className="field__error" id={errorId} role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
