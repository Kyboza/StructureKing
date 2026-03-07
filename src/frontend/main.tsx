import { StrictMode } from 'react'

import * as Sentry from '@sentry/react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'

import App from './App.tsx'
import AppContext from './contexts/AppContext.tsx'

import './index.css'

Sentry.init({
    dsn: import.meta.env.SENTRY_DSN,
    environment: import.meta.env.MODE,
    sendDefaultPii: true,
})

const container = document.getElementById('root')
const root = createRoot(container!)

root.render(
    <StrictMode>
        <AppContext>
            <BrowserRouter>
                <App />
            </BrowserRouter>
        </AppContext>
    </StrictMode>
)
