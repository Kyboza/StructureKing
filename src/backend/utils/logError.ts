import * as Sentry from '@sentry/node'

import { env } from '../validation/zod.config-server.js'

Sentry.init({
    dsn: env.SENTRY_DSN,
    environment: process.env.NODE_ENV,
    tracesSampleRate: 0.2,
})

export function logError(error: unknown) {
    const errToLog = error instanceof Error ? error : new Error(String(error))
    if (process.env.NODE_ENV === 'development') {
        console.error(errToLog)
    } else {
        Sentry.captureException(errToLog)
    }
}
