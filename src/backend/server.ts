import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import { corsOptions } from './config/corsOptions.ts';
import { connectToDatabase } from './clients/db.ts';
import { logError } from './utils/logError.ts';
import { env } from './validation/zod.config-server.ts';

import { ratelimitCheck } from './middleware/ratelimit/ratelimitCheck.ts';
import { verifyJWT } from './middleware/auth/verifyJWT.ts'
import { verifyAdmin } from './middleware/auth/verifyAdmin.ts';
import { noJWTAllowed } from './middleware/auth/noJWTAllowed.ts';


import registerRoute from './routes/registerRoute.ts';
import loginRoute from './routes/loginRoute.ts';
import frontendRedirectRoute from './routes/frontendRedirectRoute.ts';
import refreshAccessTokenRoute from './routes/refreshAccessTokenRoute.ts';
import roomsRoute from './routes/roomRoutes.ts';
import bookingsRoute from './routes/bookingRoutes.ts';

import type { Express } from 'express';

const runServer = async () => {
  console.log("Starting server…");

  try {
    const app: Express = express();

    console.log("Connecting to database…");
    await connectToDatabase();
    console.log("Database connected ✅");

    // Middleware
    app.use(cors(corsOptions));
    app.use(cookieParser());
    app.use(express.json());
    app.use(express.urlencoded({ extended: false }));


    // API ROUTES
    console.log("Registering routes…");
    app.use("/api/register", ratelimitCheck, noJWTAllowed, registerRoute);
    app.use("/api/login", ratelimitCheck, noJWTAllowed, loginRoute);

    app.use("/api/frontendRedirect", ratelimitCheck, frontendRedirectRoute);
    app.use("/api/refreshAccessToken", ratelimitCheck, refreshAccessTokenRoute);

    app.use("/api/rooms", ratelimitCheck, verifyJWT, verifyAdmin, roomsRoute);
    app.use("/api/bookings", ratelimitCheck, verifyJWT, bookingsRoute);

    // Start server
    app.listen(env.PORT, () => {
      console.log(`App is running on PORT: ${env.PORT} 🚀`);
    });
  } catch (error) {
    console.error("Server failed during startup:");
    logError(error);
    process.exit(1); // Stop server så nodemon kan restarta
  }
};

runServer();