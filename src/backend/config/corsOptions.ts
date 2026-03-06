// config/corsOptions.ts
import { allowedOrigins } from './allowedOrigins.js'

import type { CorsOptions } from 'cors'

export const corsOptions: CorsOptions = {
    origin: function (origin, callback) {
        console.log('🔥 Incoming origin:', origin)
        console.log('📋 Allowed origins:', allowedOrigins)
        
        // TILLÅT ALLA I PRODUKTION FÖR TEST
        if (process.env.NODE_ENV === 'production') {
            console.log('✅ PRODUCTION: tillåter alla origins')
            callback(null, true)
            return
        }
        
        // För utveckling - kontrollera mot listan
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true)
        } else {
            console.log('❌ Blockerad origin:', origin)
            callback(new Error('Not allowed by CORS'))
        }
    },
    credentials: true,
    optionsSuccessStatus: 200
}