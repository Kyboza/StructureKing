// config/corsOptions.ts
import { allowedOrigins } from './allowedOrigins.js'

import type { CorsOptions } from 'cors'

export const corsOptions: CorsOptions = {
    origin: (
        origin: string | undefined,
        callback: (err: Error | null, allow?: boolean) => void
    ) => {
        // Tillåt requests utan origin (t.ex. från Postman, eller samma origin)
        if (!origin) {
            callback(null, true)
            return
        }
        
        if (allowedOrigins.includes(origin)) {
            callback(null, true)
        } else {
            console.log('Blocked origin:', origin) // För debugging
            callback(new Error('Not Allowed By CORS'))
        }
    },
    credentials: true,
    optionsSuccessStatus: 200,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}