import { useEffect, useRef } from 'react'
import { Outlet, ScrollRestoration, useLocation, useMatches, useNavigation } from 'react-router'
import Footer from '../components/Footer.jsx'
import Header from '../components/Header.jsx'
import PwaStatus from '../components/PwaStatus.jsx'

// Layout compartido por todas las rutas: encabezado, contenido y pie.
// Actualiza el título del documento, mueve el foco al contenido al navegar y
// marca la zona como ocupada mientras un loader carga datos.
export default function RootLayout() {
  const mainRef = useRef(null)
  const { pathname } = useLocation()
  const navigation = useNavigation()
  const matches = useMatches()

  const last = [...matches].reverse().find((m) => m.handle?.title)
  const title =
    typeof last?.handle.title === 'function' ? last.handle.title(last.loaderData) : last?.handle.title

  useEffect(() => {
    document.title = title ? `${title} · STAGE` : 'STAGE · Sistema de venta de boletos'
  }, [title])

  useEffect(() => {
    mainRef.current?.focus({ preventScroll: true })
  }, [pathname])

  return (
    <>
      <a className="skip-link" href="#contenido">
        Saltar al contenido
      </a>
      <PwaStatus />
      <Header />
      <div
        className={`route-progress${navigation.state === 'loading' ? ' is-active' : ''}`}
        role="progressbar"
        aria-label="Cargando la página"
        aria-hidden={navigation.state !== 'loading'}
      />
      <main className="page" id="contenido" tabIndex={-1} ref={mainRef} aria-busy={navigation.state === 'loading'}>
        <Outlet />
      </main>
      <Footer />
      <ScrollRestoration />
    </>
  )
}
