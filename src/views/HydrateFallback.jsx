import LoadingState from '../components/LoadingState.jsx'

// Se muestra mientras el router resuelve los loaders de la primera carga.
export default function HydrateFallback() {
  return (
    <main className="page">
      <LoadingState label="Cargando STAGE…" />
    </main>
  )
}
