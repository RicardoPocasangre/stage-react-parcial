// Tarjeta centrada para las pantallas de autenticación.
export default function AuthCard({ title, intro, children, footer }) {
  return (
    <section className="auth" aria-labelledby="auth-title">
      <div className="auth__card">
        <h1 className="auth__title" id="auth-title">{title}</h1>
        {intro && <p className="auth__intro">{intro}</p>}
        {children}
        {footer && <p className="auth__footer">{footer}</p>}
      </div>
    </section>
  )
}
