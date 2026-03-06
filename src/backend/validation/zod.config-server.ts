// validation/zod.config-server.ts
import path from 'path'
import { fileURLToPath } from 'url'

import dotenv from 'dotenv'
import { z } from 'zod'

import { logError } from '../utils/logError.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const projectRoot = path.resolve(__dirname, '../../../')

// Ladda env-filer med tydlig loggning
const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env.development'
const envPath = path.resolve(projectRoot, envFile)

console.log('📁 Försöker ladda env från:', envPath)
console.log('📁 Finns filen?', 'Ja')

const result = dotenv.config({ path: envPath, debug: true })
console.log('📁 dotenv result:', result.error ? 'Fel' : 'OK')

const baseServerEnvSchema = z.object({
    MONGODB_URI: z.string().min(1, 'MONGODB_URI Saknas'),
    SENTRY_DSN: z.string().min(1, 'SENTRY DSN Saknas'),
    ACCESS_TOKEN_SECRET: z.string().min(1, 'ACCESS_TOKEN_SECRET Saknas'),
    REFRESH_TOKEN_SECRET: z.string().min(1, 'REFRESH_TOKEN_SECRET Saknas'),
    PEPPER_SECRET: z.string().min(1, 'PEPPER_SECRET Saknas'),
    VITE_SENTRY_DSN: z.string().min(1, 'VITE_SENTRY_DSN Saknas'),
    UPSTASH_REDIS_REST_URL: z.string().min(1, 'UPSTASH_REDIS_REST_URL Saknas'),
    UPSTASH_REDIS_REST_TOKEN: z.string().min(1, 'UPSTASH_REDIS_REST_TOKEN Saknas'),
    VITE_BASE_PATH: z.string().min(1, 'VITE_BASE_PATH Saknas'),
    VITE_API_URL: z.string().min(1, 'VITE_API_URL Saknas'),
})

const isTest = process.env.NODE_ENV === 'test'
const serverEnvSchema = isTest ? baseServerEnvSchema.partial() : baseServerEnvSchema

console.log('🔍 Validerar miljövariabler...')
console.log('🔍 NODE_ENV:', process.env.NODE_ENV)
console.log('🔍 Tillgängliga variabler i process.env:')
const requiredVars = [
  'MONGODB_URI', 'SENTRY_DSN', 'ACCESS_TOKEN_SECRET', 'REFRESH_TOKEN_SECRET',
  'PEPPER_SECRET', 'VITE_SENTRY_DSN', 'UPSTASH_REDIS_REST_URL',
  'UPSTASH_REDIS_REST_TOKEN', 'VITE_BASE_PATH', 'VITE_API_URL'
]

requiredVars.forEach(varName => {
  console.log(`  ${varName}: ${process.env[varName] ? '✅ Finns' : '❌ SAKNAS'}`)
})

const parsed = serverEnvSchema.safeParse(process.env)

if (!parsed.success) {
    console.error('❌ Zod-validering misslyckades!')
    const formattedErrors = parsed.error.flatten()
    
    for (const [key, errors] of Object.entries(formattedErrors.fieldErrors)) {
        if (errors && errors.length > 0) {
            logError(`- ${key}: ${errors.join(', ')}`)
        }
    }
    
    logError('Ogiltiga miljövariabler')
    process.exit(1)
}

console.log('✅ Zod-validering lyckades!')
export const env = parsed.data as z.infer<typeof baseServerEnvSchema>