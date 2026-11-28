import { Link as RouterLink } from 'react-router'

// Enlace interno del Design System: envuelve el Link de React Router para que
// la navegación no recargue la página y conserve la semántica de <a>.
export default function Link({ to, className = '', children, ...rest }) {
  return (
    <RouterLink to={to} className={className} {...rest}>
      {children}
    </RouterLink>
  )
}
