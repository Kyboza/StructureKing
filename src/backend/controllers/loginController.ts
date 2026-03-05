import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

import User from '../database/models/user/user-model.ts'
import { logError } from '../utils/logError.ts'
import winstonLogger from '../utils/winstonLogger.ts'
import { loginSchema } from '../validation/zod-schemas.ts'
import { env } from '../validation/zod.config-server.ts'

import type { Request, Response } from 'express'

export async function loginUser(
    req: Request,
    res: Response
): Promise<Response> {
    try {
        const parsed = loginSchema.safeParse(req.body)
        if (!parsed.success) {
            winstonLogger.warn('Invalid login data')
            return res
                .status(400)
                .json({ error: 'Invalid data', success: false })
        }

        const { email, username, password, website } = parsed.data

        if (website) {
            winstonLogger.warn('Honeypot triggered', { status: 'honeypot' })
            return res
                .status(400)
                .json({ error: 'Could not sign in user', success: false })
        }

        const user = await User.findOne({
            $or: [{ email: email }, { username: username }],
        }).lean()
        if (!user) {
            winstonLogger.warn('User not found', { status: 'not found' })
            return res
                .status(404)
                .json({ error: 'Could not sign in user', success: false })
        }

        const isPasswordValid = await bcrypt.compare(
            password + env.PEPPER_SECRET,
            user.password
        )
        if (!isPasswordValid) {
            winstonLogger.warn('Invalid password', {
                status: 'invalid password',
            })
            return res
                .status(401)
                .json({ error: 'Could not sign in user', success: false })
        }

        const payload = {
            id: user._id.toString(),
            username: user.name,
            role: user.role,
        }

        const refreshToken = jwt.sign(payload, env.REFRESH_TOKEN_SECRET, {
            expiresIn: '7d',
        })
        const accessToken = jwt.sign(payload, env.ACCESS_TOKEN_SECRET, {
            expiresIn: '1h',
        })

        res.cookie('refresh_token', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 24 * 60 * 60 * 7 * 1000,
        })

        res.cookie('access_token', accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 60 * 60 * 1000,
        })

        return res
            .status(200)
            .json({ message: 'User logged in successfully', success: true })
    } catch (error) {
        logError(error)
        winstonLogger.error('Server error during login', { error })
        return res.status(500).json({ success: false, error: 'Server Error' })
    }
}
