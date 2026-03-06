import http from 'http'
import path from 'path'

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

import type { Express } from 'express'

// Socket.IO-server med CORS
export const io = new Server({
  cors: {
    origin: [
      "https://www.johanclifford.com", 
      "https://johanclifford.com",
      "https://structureking-production.up.railway.app"
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

    // Koppla till databasen
    await connectToDatabase()

    // Middleware
    app.use(cors(corsOptions))
    app.use(cookieParser())
    app.use(express.json())
    app.use(express.urlencoded({ extended: false }))

    // API-routes
    app.use('/api/register', ratelimitCheck, noJWTAllowed, registerRoute)
    app.use('/api/login', ratelimitCheck, noJWTAllowed, loginRoute)
    app.use('/api/logout', ratelimitCheck, verifyJWT, logoutRoute)
    app.use('/api/users', ratelimitCheck, verifyJWT, verifyAdmin, usersRoute)
    app.use('/api/frontendRedirect', ratelimitCheck, frontendRedirectRoute)
    app.use('/api/refreshAccessToken', ratelimitCheck, refreshAccessTokenRoute)
    app.use('/api/rooms', ratelimitCheck, verifyJWT, roomsRoute)
    app.use('/api/bookings', ratelimitCheck, verifyJWT, bookingsRoute)

    // Serve frontend build (Vite/React)
    app.use(express.static(path.join(__dirname, "../dist/frontend")))

    // Catch-all för React Router
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "../dist/frontend/index.html"))
    })

    // PORT från env (Railway sätter detta automatiskt)
    const PORT = process.env.PORT || 3000
    server.listen(PORT, () => console.log(`Server listening on port ${PORT}`))
  } catch (error) {
    logError(error)
    process.exit(1)
  }
}

runServer()