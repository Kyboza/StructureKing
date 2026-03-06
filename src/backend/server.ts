// LÄGG TILL DENNA HÖGST UPP (efter imports)
console.log('🔍 Kollar miljövariabler...')
console.log('NODE_ENV:', process.env.NODE_ENV)
console.log('PORT:', process.env.PORT)
console.log('MONGODB_URI finns:', !!process.env.MONGODB_URI)
console.log('ALLA tillgängliga env keys:', Object.keys(process.env).filter(key => 
  !key.includes('npm_') && !key.includes('_') && key.length < 20
))

import http from 'http'
import path from 'path'

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

export let io: Server

const runServer = async () => {
  try {
    const app: Express = express()
    const server = http.createServer(app)
    
    // Sätt CORS-headers för ALLA requests (även innan annan middleware)
    app.use((req, res, next) => {
      const origin = req.headers.origin
      console.log('Incoming request:', req.method, req.url, 'Origin:', origin)
      
      if (origin && allowedOrigins.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin)
        res.setHeader('Access-Control-Allow-Credentials', 'true')
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With')
      }
      
      // Hantera OPTIONS requests direkt
      if (req.method === 'OPTIONS') {
        console.log('OPTIONS request - returning 200')
        return res.sendStatus(200)
      }
      
      next()
    })

    // Initiera Socket.IO med explicit CORS
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

    // Socket.IO connection logging
    io.on('connection', (socket) => {
      console.log('🟢 Socket.IO ansluten:', socket.id)
      socket.on('disconnect', () => {
        console.log('🔴 Socket.IO frånkopplad:', socket.id)
      })
    })

    // await connectToDatabase()

    // Vanlig CORS middleware som backup
    app.use(cors(corsOptions))
    
    app.use(cookieParser())
    app.use(express.json())
    app.use(express.urlencoded({ extended: false }))

    // Test endpoint för att verifiera CORS
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

    const frontendDistPath = path.join(__dirname, "../dist/frontend")
    app.use(express.static(frontendDistPath))

    app.get("*", (req, res, next) => {
      if (req.path.startsWith('/api/')) {
        return next()
      }
      res.sendFile(path.join(frontendDistPath, "index.html"))
    })

    const PORT = process.env.PORT || 3000
    server.listen(PORT, () => {
      console.log(`🚀 Server listening on port ${PORT}`)
      console.log(`📋 CORS tillåter origins:`, allowedOrigins)
      console.log(`🔌 Socket.IO path: /socket.io/`)
    })
  } catch (error) {
    logError(error)
    process.exit(1)
  }
}

runServer()