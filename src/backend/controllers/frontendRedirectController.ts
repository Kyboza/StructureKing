import jwt from 'jsonwebtoken'

import { logError } from '../utils/logError.js'
import { env } from '../validation/zod.config-server.js'

import type { Request, Response } from 'express'

type Role = 'User' | 'Admin'
type RequiredMode = 'None' | Role

interface AccessClaims {
    role: Role
    username: string
    iat?: number
    exp?: number
}

export async function frontendRedirect(
    req: Request,
    res: Response
): Promise<Response> {
    const required = (req.body?.require as RequiredMode | undefined) ?? 'None'
    const accessToken = req.cookies?.['access_token']
    const refreshToken = req.cookies?.['refresh_token']

    // Ingen access token
    if (!accessToken) {
        if (required === 'None' && refreshToken) {
            return res.status(401).json({
                authenticated: false,
                role: 'None',
                success: false,
                reason: 'unauthorized',
            })
        } else if (required === 'None') {
            return res.status(200).json({
                authenticated: false,
                role: 'None',
                success: true,
            })
        }

        return res.status(401).json({
            authenticated: false,
            role: 'None',
            success: false,
            reason: 'unauthorized',
        })
    }

    let claims: AccessClaims

    try {
        // Verifiera token
        claims = jwt.verify(
            accessToken,
            env.ACCESS_TOKEN_SECRET
        ) as AccessClaims
    } catch (error) {
        logError(error)

        // Token expired → trigga refresh
        if (error instanceof jwt.TokenExpiredError) {
            return res.status(401).json({
                authenticated: false,
                role: 'None',
                success: false,
                reason: 'expired',
            })
        }

        // Token manipulerad / ogiltig → logga ut user
        if (error instanceof jwt.JsonWebTokenError) {
            res.clearCookie('refresh_token')
            res.clearCookie('access_token')
            return res.status(401).json({
                authenticated: false,
                role: 'None',
                success: false,
                reason: 'invalid',
            })
        }

        // Övriga fel → 500
        return res.status(500).json({
            authenticated: false,
            role: 'None',
            success: false,
        })
    }

    // Sida kräver ingen auth (t.ex login/register page)
    if (required === 'None') {
        return res.status(200).json({
            authenticated: true,
            role: claims.role,
            username: claims.username,
            success: true,
        })
    }

    // Admin-sida
    if (required === 'Admin') {
        if (claims.role !== 'Admin') {
            return res.status(403).json({
                authenticated: true,
                role: claims.role,
                username: claims.username,
                success: false,
                reason: 'forbidden',
            })
        }

        return res.status(200).json({
            authenticated: true,
            role: 'Admin',
            username: claims.username,
            success: true,
        })
    }

    // User-sida
    return res.status(200).json({
        authenticated: true,
        role: claims.role,
        username: claims.username,
        success: true,
    })
}
