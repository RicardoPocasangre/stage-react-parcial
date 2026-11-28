import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router/dom'
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
import './styles/pwa.css'
import { warmApiCache } from './api/db.js'
import { createAppRouter } from './router.jsx'
import { StoreProvider } from './state/StoreProvider.jsx'

warmApiCache()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <StoreProvider>
      <RouterProvider router={createAppRouter()} />
    </StoreProvider>
  </StrictMode>,
)
