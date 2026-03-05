
import http from 'http'

import cookieParser from 'cookie-parser'
import cors from 'cors'
import express from 'express'
import { Server } from 'socket.io'

import { connectToDatabase } from './clients/db.ts'
import { corsOptions } from './config/corsOptions.ts'
import { noJWTAllowed } from './middleware/auth/noJWTAllowed.ts'
import { verifyAdmin } from './middleware/auth/verifyAdmin.ts'
import { verifyJWT } from './middleware/auth/verifyJWT.ts'
import { ratelimitCheck } from './middleware/ratelimit/ratelimitCheck.ts'
import bookingsRoute from './routes/bookingRoutes.ts'
import frontendRedirectRoute from './routes/frontendRedirectRoute.ts'
import loginRoute from './routes/loginRoute.ts'
import logoutRoute from './routes/logoutRoute.ts'
import refreshAccessTokenRoute from './routes/refreshAccessTokenRoute.ts'
import registerRoute from './routes/registerRoute.ts'
import roomsRoute from './routes/roomRoutes.ts'
import usersRoute from './routes/usersRoute.ts'
import { logError } from './utils/logError.ts'
import { env } from './validation/zod.config-server.ts'

import type { Express } from 'express'

export const io = new Server({
  cors: {
    origin: [
      "https://www.johanclifford.com", // frontend domän
      "https://johanclifford.com",     // om du vill tillåta root
    ],
    methods: ["GET", "POST"],
    credentials: true,
  },
})
const runServer = async () => {

    try {
        const app: Express = express()
        const server = http.createServer(app)
        io.attach(server)

        await connectToDatabase()

        app.use(cors(corsOptions))
        app.use(cookieParser())
        app.use(express.json())
        app.use(express.urlencoded({ extended: false }))

        app.use('/api/register', ratelimitCheck, noJWTAllowed, registerRoute)
        app.use('/api/login', ratelimitCheck, noJWTAllowed, loginRoute)
        app.use('/api/logout', ratelimitCheck, verifyJWT, logoutRoute)
        app.use(
            '/api/users',
            ratelimitCheck,
            verifyJWT,
            verifyAdmin,
            usersRoute
        )

        app.use('/api/frontendRedirect', ratelimitCheck, frontendRedirectRoute)
        app.use(
            '/api/refreshAccessToken',
            ratelimitCheck,
            refreshAccessTokenRoute
        )

        app.use('/api/rooms', ratelimitCheck, verifyJWT, roomsRoute)
        app.use('/api/bookings', ratelimitCheck, verifyJWT, bookingsRoute)

        server.listen(env.PORT)

}
     catch (error) {
      
        logError(error)
        process.exit(1)
    }
}

runServer()
