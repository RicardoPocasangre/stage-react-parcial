import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router'
import { useCart, useSession } from '../state/StoreProvider.jsx'
import { asset } from '../utils/assets.js'
import Link from './Link.jsx'

// Encabezado con navegación principal y menú hamburguesa en tablet y móvil.
// Lee la sesión y el carrito del Context: no recibe props.
export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const { user, isStaff, logout } = useSession()
  const { count } = useCart()
  const navigate = useNavigate()

  const closeMenu = () => setMenuOpen(false)

  const navLink = (to, label, end = false) => (
    <li>
      <NavLink className="main-nav__link" to={to} end={end} onClick={closeMenu}>
        {label}
      </NavLink>
    </li>
  )

  return (
    <header className="site-header">
      <div className="site-header__inner">
        <Link className="logo" to="/" aria-label="STAGE, ir al inicio" onClick={closeMenu}>
          <img className="logo__mark" src={asset('img/logo.png')} alt="" width="40" height="32" />
          <span className="logo__name">STAGE</span>
        </Link>

        <nav id="main-nav" className={`main-nav${menuOpen ? ' is-open' : ''}`} aria-label="Navegación principal">
          <ul className="main-nav__list">
            {navLink('/', 'Inicio', true)}
            {navLink('/eventos', 'Eventos')}
            {user && navLink('/boletos', 'Mis boletos')}
            {isStaff && navLink('/admin', 'Panel')}
            {user ? (
              <>
                {navLink('/perfil', 'Mi perfil')}
                <li>
                  <button
                    type="button"
                    className="main-nav__link main-nav__button"
                    onClick={() => {
                      closeMenu()
                      logout()
                      navigate('/')
                    }}
                  >
                    Cerrar sesión
                  </button>
                </li>
              </>
            ) : (
              navLink('/login', 'Iniciar sesión')
            )}
          </ul>
        </nav>

        <div className="header-actions">
          <Link
            className="header-actions__item cart-link"
            to="/carrito"
            onClick={closeMenu}
            aria-label={`Carrito de compras, ${count} ${count === 1 ? 'artículo' : 'artículos'}`}
          >
            <img src={asset('img/icon-cart.png')} alt="" width="24" height="24" />
            {count > 0 && <span className="cart-link__count">{count}</span>}
          </Link>
          <button
            type="button"
            className="menu-button"
            aria-expanded={menuOpen}
            aria-controls="main-nav"
            onClick={() => setMenuOpen((open) => !open)}
          >
            <img src={asset('img/icon-menu.png')} alt="" width="24" height="24" />
            <span className="visually-hidden">{menuOpen ? 'Cerrar menú' : 'Abrir menú'}</span>
          </button>
        </div>
      </div>
    </header>
  )
}
