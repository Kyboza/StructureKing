import jwt from 'jsonwebtoken'


import { logError } from '../utils/logError.js'
import { env } from '../validation/zod.config-server.js'

import type { JwtClaims } from '../types/express.js'
import type { Request, Response } from 'express'

export async function refreshAccessToken(req: Request, res: Response) {
    try {
        const refresh = req.cookies?.['refresh_token']
        if (!refresh) {
            return res
                .status(401)
                .json({ ok: false, error: 'Missing refresh token' })
        }

        const refreshSecret = env.REFRESH_TOKEN_SECRET
        const accessSecret = env.ACCESS_TOKEN_SECRET
        if (!refreshSecret || !accessSecret) {
            return res
                .status(500)
                .json({ ok: false, error: 'Server misconfiguration' })
        }

        const payload = jwt.verify(refresh, refreshSecret) as JwtClaims

        const accessToken = jwt.sign(
            { id: payload.id, username: payload.name, role: payload.role },
            accessSecret,
            { expiresIn: '1h' }
        )

        res.cookie('access_token', accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'none',
            maxAge: 60 * 60 * 1000,
        })

        return res.status(200).json({ ok: true })
    } catch (error) {
        logError(error)
        if (error instanceof jwt.TokenExpiredError) {
            return res
                .status(401)
                .json({ ok: false, error: 'Refresh token expired' })
        }
        if (error instanceof jwt.JsonWebTokenError) {
            res.clearCookie('refresh_token', { path: '/' })
            res.clearCookie('access_token', { path: '/' })
            return res
                .status(401)
                .json({ ok: false, error: 'Invalid refresh token' })
        }
        return res
            .status(500)
            .json({ ok: false, error: 'Internal Server Error' })
    }
}
