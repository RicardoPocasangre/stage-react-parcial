// Botón del Design System: variantes primary, secondary, ghost y danger.
export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  block = false,
  type = 'button',
  className = '',
  children,
  disabled,
  ...rest
}) {
  const classes = ['btn', `btn--${variant}`, `btn--${size}`, block ? 'btn--block' : '', className]
    .filter(Boolean)
    .join(' ')

  return (
    <button
      type={type}
      className={classes}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading && <span className="btn__spinner" aria-hidden="true" />}
      {children}
    </button>
  )
}
