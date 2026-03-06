import http from 'http'
import path from 'path'
import { fileURLToPath } from 'url'

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

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export let io: Server

const runServer = async () => {
  try {
    
    const app: Express = express()
    const server = http.createServer(app)
    
  
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
    
    await connectToDatabase()
  
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

    // Statisk filserver
    const frontendDistPath = path.resolve(__dirname, '../../frontend/dist')
    console.log('📁 Statisk mapp sökväg:', frontendDistPath)
    
    // Kontrollera om mappen finns
    app.use(express.static(frontendDistPath))

    app.use((req, res, next) => {
      if (req.path.startsWith('/api/') || req.path.startsWith('/socket.io/')) {
        return next()
      }
      
      res.sendFile(path.join(frontendDistPath, "index.html"), (err) => {
        if (err) {
          next(err)
        }
      })
    })

    const PORT = process.env.PORT || 3000
    server.listen(PORT)


  } catch (error) {
    logError(error)
    process.exit(1)
  }
}

runServer()