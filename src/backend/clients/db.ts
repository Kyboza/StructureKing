import mongoose from "mongoose"
import { env } from "../validation/zod.config-server.ts"
import { logError } from "../utils/logError.ts"

const MONGODB_URI = env.MONGODB_URI as string

export async function connectToDatabase() {
    try {
        await mongoose.connect(MONGODB_URI, { dbName: "BackendUtveckling" })
        return { success: true, message: "Connected" }
    } catch (error) {
        logError(error)
        process.exit(1)
    }
}

