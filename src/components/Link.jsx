// Enlace de navegación por estado (sin React Router en esta entrega).
// Conserva la semántica de <a> y evita la recarga de la página.
export default function Link({ navigate, to, params, className = '', current = false, children, ...rest }) {
  return (
    <a
      href="#"
      className={className}
      aria-current={current ? 'page' : undefined}
      onClick={(event) => {
        event.preventDefault()
        navigate(to, params)
      }}
      {...rest}
    >
      {children}
    </a>
  )
}
