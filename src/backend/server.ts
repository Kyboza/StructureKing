// LÄGG TILL DENNA HÖGST UPP (efter imports)
console.log('🔍 Kollar miljövariabler...')
console.log('NODE_ENV:', process.env.NODE_ENV)
console.log('PORT:', process.env.PORT)
console.log('MONGODB_URI finns:', !!process.env.MONGODB_URI)
console.log('Current directory:', process.cwd())

import http from 'http'
import path from 'path'
import { fileURLToPath } from 'url'

import cookieParser from 'cookie-parser'
import cors from 'cors'
import express from 'express'
import { Server } from 'socket.io'

// import { connectToDatabase } from './clients/db.js'
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

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
console.log('__dirname:', __dirname)

export let io: Server

const runServer = async () => {
  try {
    console.log('🚀 STARTAR SERVER...')
    
    const app: Express = express()
    const server = http.createServer(app)
    
    // Initiera Socket.IO med CORS
    io = new Server(server, {
      cors: {
        origin: allowedOrigins,
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        credentials: true,
        allowedHeaders: ["Content-Type", "Authorization"]
      },
      transports: ['polling', 'websocket'],
      allowEIO3: true,
      path: '/socket.io/'
    })

    io.on('connection', (socket) => {
      console.log('🟢 Socket.IO ansluten:', socket.id)
      socket.on('disconnect', () => {
        console.log('🔴 Socket.IO frånkopplad:', socket.id)
      })
    })

    // await connectToDatabase()

    // ==== CORS middleware (endast EN gång) ====
    app.use(cors(corsOptions))
    
    app.use(cookieParser())
    app.use(express.json())
    app.use(express.urlencoded({ extended: false }))

    // Test endpoint
    app.get('/api/test', (req, res) => {
      res.json({ message: 'CORS fungerar!', origin: req.headers.origin })
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

    // ==== Statisk filserver och middleware ====
    
    const frontendDistPath = path.resolve(__dirname, '../../frontend/dist')
    console.log('📁 Statisk mapp sökväg:', frontendDistPath)
    
    // Servera statiska filer (CSS, JS, bilder etc)
    app.use(express.static(frontendDistPath))

    // Middleware för att hantera alla icke-API requests
    app.use((req, res, next) => {
      // Hoppa över API och Socket.IO anrop
      if (req.path.startsWith('/api/') || req.path.startsWith('/socket.io/')) {
        return next()
      }
      
      // Skicka index.html för alla andra requests
      res.sendFile(path.join(frontendDistPath, "index.html"), (err) => {
        if (err) {
          console.error('❌ Kunde inte skicka index.html:', err)
          next(err)
        }
      })
    })

    const PORT = process.env.PORT || 3000
    server.listen(PORT, () => {
      console.log(`🚀 Server listening on port ${PORT}`)
      console.log(`📋 CORS tillåter origins:`, allowedOrigins)
      console.log(`🔌 Socket.IO path: /socket.io/`)
    })

    process.on('uncaughtException', (error) => {
      console.error('❌ Oväntat fel:', error)
    })

  } catch (error) {
    console.error('❌ Server start misslyckades:', error)
    logError(error)
  }
}

runServer()