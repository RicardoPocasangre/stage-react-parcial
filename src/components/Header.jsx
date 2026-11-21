import { useState } from 'react'
import Link from './Link.jsx'

// Encabezado con navegación principal y menú hamburguesa en tablet y móvil.
export default function Header({ route, user, cartCount, navigate, onLogout }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const isStaff = user && (user.role === 'administrador' || user.role === 'organizador')

  const go = (to, params) => {
    setMenuOpen(false)
    navigate(to, params)
  }

  return (
    <header className="site-header">
      <div className="site-header__inner">
        <Link className="logo" navigate={go} to="events" aria-label="STAGE, ir al inicio">
          <img className="logo__mark" src="/img/logo.png" alt="" width="40" height="32" />
          <span className="logo__name">STAGE</span>
        </Link>

        <nav
          id="main-nav"
          className={`main-nav${menuOpen ? ' is-open' : ''}`}
          aria-label="Navegación principal"
        >
          <ul className="main-nav__list">
            <li>
              <Link
                className="main-nav__link"
                navigate={go}
                to="events"
                current={route.name === 'events' || route.name === 'event'}
              >
                Eventos
              </Link>
            </li>
            {user && (
              <li>
                <Link
                  className="main-nav__link"
                  navigate={go}
                  to="tickets"
                  current={route.name === 'tickets'}
                >
                  Mis boletos
                </Link>
              </li>
            )}
            {isStaff && (
              <li>
                <Link
                  className="main-nav__link"
                  navigate={go}
                  to="admin"
                  current={route.name === 'admin'}
                >
                  Panel
                </Link>
              </li>
            )}
            {user ? (
              <>
                <li>
                  <Link
                    className="main-nav__link"
                    navigate={go}
                    to="profile"
                    current={route.name === 'profile'}
                  >
                    Mi perfil
                  </Link>
                </li>
                <li>
                  <button
                    type="button"
                    className="main-nav__link main-nav__button"
                    onClick={() => {
                      setMenuOpen(false)
                      onLogout()
                    }}
                  >
                    Cerrar sesión
                  </button>
                </li>
              </>
            ) : (
              <li>
                <Link
                  className="main-nav__link"
                  navigate={go}
                  to="login"
                  current={route.name === 'login'}
                >
                  Iniciar sesión
                </Link>
              </li>
            )}
          </ul>
        </nav>

        <div className="header-actions">
          <Link
            className="header-actions__item cart-link"
            navigate={go}
            to="cart"
            aria-label={`Carrito de compras, ${cartCount} ${cartCount === 1 ? 'artículo' : 'artículos'}`}
          >
            <img src="/img/icon-cart.png" alt="" width="24" height="24" />
            {cartCount > 0 && <span className="cart-link__count">{cartCount}</span>}
          </Link>
          <button
            type="button"
            className="menu-button"
            aria-expanded={menuOpen}
            aria-controls="main-nav"
            onClick={() => setMenuOpen((open) => !open)}
          >
            <img src="/img/icon-menu.png" alt="" width="24" height="24" />
            <span className="visually-hidden">{menuOpen ? 'Cerrar menú' : 'Abrir menú'}</span>
          </button>
        </div>
      </div>
    </header>
  )
}
