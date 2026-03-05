import * as Sentry from '@sentry/node'
import dotenv from 'dotenv'

dotenv.config()

Sentry.init({
    dsn: process.env.SENTRY_DSN,
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
