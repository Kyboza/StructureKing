import mongoose from 'mongoose'

import { logError } from '../utils/logError.ts'
import { env } from '../validation/zod.config-server.ts'


export async function connectToDatabase() {
    try {
        await mongoose.connect(env.MONGODB_URI, { dbName: 'BackendUtveckling' })
        return { success: true, message: 'Connected' }
    } catch (error) {
        logError(error)
        throw error
    }
}
