// config/corsOptions.ts
import { allowedOrigins } from './allowedOrigins.js'

import type { CorsOptions } from 'cors'

export const corsOptions: CorsOptions = {
    origin: function (origin, callback) {
        if (process.env.NODE_ENV === 'production') {
            callback(null, true)
            return
        }

        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true)
        } else {
            callback(new Error('Not allowed by CORS'))
        }
    },
    credentials: true,
    optionsSuccessStatus: 200,
}
