import http from 'http'
import path from 'path'

import cookieParser from 'cookie-parser'
import cors from 'cors'
import express from 'express'
import { Server } from 'socket.io'

import { connectToDatabase } from './clients/db.js'
import { allowedOrigins } from './config/allowedOrigins.js'
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

// Vi deklarerar io här men initierar den senare med servern
export let io: Server

const runServer = async () => {
  try {
    const app: Express = express()
    const server = http.createServer(app)
    
    // Initiera Socket.IO med servern och korrekt CORS-konfiguration
    io = new Server(server, {
      cors: {
        origin: allowedOrigins,
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        credentials: true,
        allowedHeaders: ["Content-Type", "Authorization"]
      },
      transports: ['polling', 'websocket'], // Börja med polling för bättre kompatibilitet
      allowEIO3: true,
      path: '/socket.io/'
    })

    // Koppla till databasen
    await connectToDatabase()

    // Middleware - CORS först, och hantera preflight requests explicit
    app.use(cors(corsOptions))
    app.options('*', cors(corsOptions)) // Explicit hantering av OPTIONS requests
    
    app.use(cookieParser())
    app.use(express.json())
    app.use(express.urlencoded({ extended: false }))

    // Logga inkommande requests för debugging (ta bort i produktion om du vill)
    app.use((req, _res, next) => {
      console.log(`${req.method} ${req.path} - Origin: ${req.get('origin') || 'ingen origin'}`)
      next()
    })

    // API-routes
    app.use('/api/register', ratelimitCheck, noJWTAllowed, registerRoute)
    app.use('/api/login', ratelimitCheck, noJWTAllowed, loginRoute)
    app.use('/api/logout', ratelimitCheck, verifyJWT, logoutRoute)
    app.use('/api/users', ratelimitCheck, verifyJWT, verifyAdmin, usersRoute)
    app.use('/api/frontendRedirect', ratelimitCheck, frontendRedirectRoute)
    app.use('/api/refreshAccessToken', ratelimitCheck, refreshAccessTokenRoute)
    app.use('/api/rooms', ratelimitCheck, verifyJWT, roomsRoute)
    app.use('/api/bookings', ratelimitCheck, verifyJWT, bookingsRoute)

    // Statisk filserver för frontend
    const frontendDistPath = path.join(__dirname, "../dist/frontend")
    app.use(express.static(frontendDistPath))

    // Alla icke-API routes skickas till index.html
    app.get("*", (req, res, next) => {
      // Undvik att fånga API-routes
      if (req.path.startsWith('/api/')) {
        return next()
      }
      res.sendFile(path.join(frontendDistPath, "index.html"))
    })

    // PORT från env (Railway sätter detta automatiskt)
    const PORT = process.env.PORT || 3000
    server.listen(PORT)

  } catch (error) {
    logError(error)
    process.exit(1)
  }
}

runServer()