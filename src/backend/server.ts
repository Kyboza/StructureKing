
import http from 'http'

import cookieParser from 'cookie-parser'
import cors from 'cors'
import express from 'express'
import { Server } from 'socket.io'

import { connectToDatabase } from './clients/db.js'
import { corsOptions } from './config/corsOptions.js'
import { noJWTAllowed } from './middleware/auth/noJWTAllowed.js'
import { verifyAdmin } from './middleware/auth/verifyAdmin.js'
import { verifyJWT } from './middleware/auth/verifyJWT.js'
import { ratelimitCheck } from './middleware/ratelimit/ratelimitCheck.js'
import bookingsRoute from './routes/bookingRoutes.js'
import frontendRedirectRoute from './routes/frontendRedirectRoute.js'
import loginRoute from './routes/loginRoute.js'
import logoutRoute from './routes/logoutRoute.js'
import refreshAccessTokenRoute from './routes/refreshAccessTokenRoute.js'
import registerRoute from './routes/registerRoute.js'
import roomsRoute from './routes/roomRoutes.js'
import usersRoute from './routes/usersRoute.js'
import { logError } from './utils/logError.js'
import { env } from './validation/zod.config-server.js'

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
