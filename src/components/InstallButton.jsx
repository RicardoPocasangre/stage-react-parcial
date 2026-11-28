import { useEffect, useState } from 'react'

// Botón «Instalar app». Chrome y Edge emiten `beforeinstallprompt` cuando la
// PWA cumple los criterios de instalación; aquí se guarda el evento y se
// lanza cuando la persona lo pide.
export default function InstallButton() {
  const [promptEvent, setPromptEvent] = useState(null)

  useEffect(() => {
    const onPrompt = (event) => {
      event.preventDefault()
      setPromptEvent(event)
    }
    const onInstalled = () => setPromptEvent(null)
    window.addEventListener('beforeinstallprompt', onPrompt)
    window.addEventListener('appinstalled', onInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [])

  if (!promptEvent) return null

  const install = async () => {
    await promptEvent.prompt()
    setPromptEvent(null)
  }

  return (
    <button type="button" className="install-button" onClick={install}>
      Instalar app
    </button>
  )
}
