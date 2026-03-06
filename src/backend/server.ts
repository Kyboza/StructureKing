
import http from 'http'

import cookieParser from 'cookie-parser'
import cors from 'cors'
import express from 'express'
import { Server } from 'socket.io'

import { connectToDatabase } from './clients/db'
import { corsOptions } from './config/corsOptions'
import { noJWTAllowed } from './middleware/auth/noJWTAllowed'
import { verifyAdmin } from './middleware/auth/verifyAdmin'
import { verifyJWT } from './middleware/auth/verifyJWT'
import { ratelimitCheck } from './middleware/ratelimit/ratelimitCheck'
import bookingsRoute from './routes/bookingRoutes'
import frontendRedirectRoute from './routes/frontendRedirectRoute'
import loginRoute from './routes/loginRoute'
import logoutRoute from './routes/logoutRoute'
import refreshAccessTokenRoute from './routes/refreshAccessTokenRoute'
import registerRoute from './routes/registerRoute'
import roomsRoute from './routes/roomRoutes'
import usersRoute from './routes/usersRoute'
import { logError } from './utils/logError'
import { env } from './validation/zod.config-server'

import type { Express } from 'express'

export const io = new Server({
  cors: {
    origin: [
      "https://www.johanclifford.com", 
      "https://johanclifford.com",     
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
