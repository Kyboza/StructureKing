// config/corsOptions.ts
import { allowedOrigins } from './allowedOrigins.js'

import type { CorsOptions } from 'cors'

export const corsOptions: CorsOptions = {
    origin: (
        origin: string | undefined,
        callback: (err: Error | null, allow?: boolean) => void
    ) => {
        // Logga varje request
        console.log('=== CORS Check ===')
        console.log('Origin:', origin)
        console.log('Allowed origins:', allowedOrigins)
        console.log('NODE_ENV:', process.env.NODE_ENV)
        
        // Tillåt requests utan origin (t.ex. från samma origin)
        if (!origin) {
            console.log('✅ Ingen origin - tillåter')
            callback(null, true)
            return
        }
        
        // Kolla om origin är tillåten
        if (allowedOrigins.includes(origin)) {
            console.log('✅ Origin tillåten:', origin)
            callback(null, true)
        } else {
            console.log('❌ CORS-blockerad origin:', origin)
            callback(new Error('Not Allowed By CORS'))
        }
    },
    credentials: true,
    optionsSuccessStatus: 200,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['Set-Cookie']
}