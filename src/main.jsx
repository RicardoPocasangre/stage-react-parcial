import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/tokens.css'
import './styles/base.css'
import './styles/ui.css'
import './styles/states.css'
import './styles/layout.css'
import './styles/events.css'
import './styles/checkout.css'
import './styles/confirm.css'
import './styles/account.css'
import './styles/admin.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
