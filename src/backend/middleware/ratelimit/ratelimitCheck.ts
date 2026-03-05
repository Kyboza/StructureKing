// TypeScript

import { rateLimiter } from '../../config/ratelimiter.ts'
import { logError } from '../../utils/logError.ts'

import type { NextFunction, Request, Response } from 'express'

export async function ratelimitCheck(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<Response | void> {
    try {
        // 1) Försök hämta IP från X-Forwarded-For (komma-separerad lista), annars Express' req.ip
        const xff = req.headers['x-forwarded-for']
        const raw = Array.isArray(xff) ? xff[0] : xff // header kan vara string eller string[]
        const firstForwardedIp = raw?.split(',')[0]?.trim()

        const ip = firstForwardedIp || req.ip || '127.0.0.1'

        // 2) Kör rate limit
        const { success } = await rateLimiter.limit(ip)
        if (!success) {
            return res.status(429).json({ error: 'Too Many Requests' })
        }

        next()
    } catch (error) {
        logError(error)
        return res.status(500).json({ error: 'Internal Server Error' })
    }
}
