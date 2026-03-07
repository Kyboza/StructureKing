import jwt from 'jsonwebtoken'

import { env } from '../../validation/zod.config-server.js'

import type { NextFunction, Request, Response } from 'express'

export function noJWTAllowed(
    req: Request,
    res: Response,
    next: NextFunction
): Response | void {
    const accessToken = req.cookies?.['access_token']
    const refreshToken = req.cookies?.['refresh_token']

    if (accessToken) {
        return res
            .status(403)
            .json({ error: 'Signed in users prohibited from this page' })
    }

    if (refreshToken) {
        try {
            jwt.verify(refreshToken, env.REFRESH_TOKEN_SECRET)

            return res.status(403).json({
                error: 'Signed in users prohibited from this page',
            })
        } catch {
            res.clearCookie('refresh_token', {secure: true, httpOnly: true, sameSite: 'none' })
        }
    }

    next()
}
