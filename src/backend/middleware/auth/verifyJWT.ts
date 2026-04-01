import jwt from 'jsonwebtoken'

import { logError } from '../../utils/logError.js'
import { env } from '../../validation/zod.config-server.js'

import type { JwtClaims } from '../../types/express.d.js'
import type { NextFunction, Request, Response } from 'express'

export async function verifyJWT(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<Response | void> {
    try {
        const accessToken = req.cookies?.['access_token']

        if (!accessToken) {
            return res
                .status(401)
                .json({ error: 'Unauthorized, no token' })
        }

        let decoded: JwtClaims

        try {
            decoded = jwt.verify(
                accessToken,
                env.ACCESS_TOKEN_SECRET
            ) as JwtClaims
        } catch (err) {
            logError(err)
            return res
                .status(401)
                .json({ error: 'Unauthorized, invalid or expired token' })
        }

        req.user = {
            id: decoded.id,
            username: decoded.username,
            role: decoded.role,
        }

        return next()
    } catch (error) {
        logError(error)
        return res.status(500).json({ error: 'Server Error' })
    }
}