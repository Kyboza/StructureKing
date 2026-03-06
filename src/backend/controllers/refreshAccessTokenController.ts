import jwt from 'jsonwebtoken'

import { logError } from '../utils/logError'
import { env } from '../validation/zod.config-server'

import type { Request, Response } from 'express'

type Role = 'User' | 'Admin'

interface RefreshClaims {
    id: string
    name: string
    role: Role
    iat?: number
    exp?: number
}
export async function refreshAccessToken(req: Request, res: Response) {
    try {
        const refresh = req.cookies?.['refresh_token']
        if (!refresh) {
            return res
                .status(401)
                .json({ ok: false, error: 'Missing refresh token' })
        }

        const refreshSecret = env.REFRESH_TOKEN_SECRET as string | undefined
        const accessSecret = env.ACCESS_TOKEN_SECRET as string | undefined
        if (!refreshSecret || !accessSecret) {
            return res
                .status(500)
                .json({ ok: false, error: 'Server misconfiguration' })
        }

        const payload = jwt.verify(refresh, refreshSecret) as RefreshClaims

        const accessToken = jwt.sign(
            { id: payload.id, username: payload.name, role: payload.role },
            accessSecret,
            { expiresIn: '1h' }
        )

        res.cookie('access_token', accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            path: '/',
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
            return res
                .status(401)
                .json({ ok: false, error: 'Invalid refresh token' })
        }
        return res
            .status(500)
            .json({ ok: false, error: 'Internal Server Error' })
    }
}
