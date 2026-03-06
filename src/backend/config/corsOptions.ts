import { allowedOrigins } from './allowedOrigins'

import type { CorsOptions } from 'cors'


export const corsOptions: CorsOptions = {
    origin: (
        origin: string | undefined,
        callback: (err: Error | null, allow?: boolean) => void
    ) => {
        if (allowedOrigins.includes(origin!) || !origin) {
            callback(null, true)
        } else {
            callback(new Error('Not Allowed By CORS'))
        }
    },
    credentials: true,
    optionsSuccessStatus: 200,
}
