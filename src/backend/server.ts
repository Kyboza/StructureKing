import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { corsOptions } from './config/corsOptions'
import { connectToDatabase } from './clients/db'
import { logError } from './utils/logError'
import { env } from './validation/zod.config-server'

import registerRoute from './routes/registerRoute'
import loginRoute from './routes/loginRoute'


import type { Express } from 'express'


const runServer = async() => {
    try {
        const app: Express = express()
        await connectToDatabase(); 

        app.use(cors(corsOptions));
        app.use(express.json());
        app.use(express.urlencoded({extended: false}));
        app.use(cookieParser());

       //Routes
        app.post("/api/register", registerRoute);
        app.post("/api/login", loginRoute);




        app.listen(env.PORT, () => {
            console.log(`App is running on PORT: ${env.PORT}`)
        })

    } catch(error){
        logError(error)
    }
}
runServer();