import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { corsOptions } from './config/corsOptions.ts';
import { connectToDatabase } from './clients/db.ts';
import { logError } from './utils/logError.ts';
import { env } from './validation/zod.config-server.ts';

import { ratelimitCheck } from './middleware/ratelimit/ratelimitCheck.ts';
// import { verifyJWT } from './middleware/auth/verifyJWT'

import registerRoute from './routes/registerRoute.ts';
import loginRoute from './routes/loginRoute.ts';
import frontendRedirectRoute from './routes/frontendRedirectRoute.ts';
import refreshAccessTokenRoute from './routes/refreshAccessTokenRoute.ts';

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
    // app.set("trust proxy", 1);
    app.use(cookieParser());
    app.use(express.json());
    app.use(express.urlencoded({ extended: false }));

    // Routes
    console.log("Registering routes…");
    app.post("/api/register", ratelimitCheck, registerRoute);
    app.post("/api/login", ratelimitCheck, loginRoute);
    app.post("/api/frontendRedirect", ratelimitCheck, frontendRedirectRoute);
    app.post("/api/refreshAccessToken", ratelimitCheck, refreshAccessTokenRoute);

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