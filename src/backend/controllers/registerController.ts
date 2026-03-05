import bcrypt from 'bcrypt'


import User from '../database/models/user/user-model.ts'
import { logError } from '../utils/logError.ts'
import winstonLogger from '../utils/winstonLogger.ts'
import { registerSchema } from '../validation/zod-schemas.ts'
import { env } from '../validation/zod.config-server.ts'

import type { Request, Response } from 'express'

export async function registerUser(
    req: Request,
    res: Response
): Promise<Response> {
    try {
        const parsed = registerSchema.safeParse(req.body)

        if (!parsed.success) {
            winstonLogger.warn('Invalid registration data')
            return res
                .status(400)
                .json({ error: 'Invalid data', success: false })
        }

        const { email, username, password, website } = parsed.data

        if (website) {
            winstonLogger.warn('Honeypot triggered', { status: 'honeypot' })
            return res
                .status(400)
                .json({ error: 'Could not register user', success: false })
        }

        const doesUserExist = await User.findOne({ email })
        if (doesUserExist) {
            winstonLogger.warn('Duplicate registration attempt', {
                status: 'duplicate',
            })
            return res
                .status(400)
                .json({ error: 'Could not register user', success: false })
        }

        const hashedPassword = await bcrypt.hash(
            password + env.PEPPER_SECRET,
            12
        )

        const newUser = await User.create({
            email,
            name: username,
            password: hashedPassword,
        })

        winstonLogger.info('User registered successfully', {
            userId: newUser._id,
        })

        return res
            .status(201)
            .json({ message: 'User registered successfully', success: true })
    } catch (error) {
        logError(error)
        winstonLogger.error('Server error during registration', { error })
        return res.status(500).json({ error: 'Server Error', success: false })
    }
}
